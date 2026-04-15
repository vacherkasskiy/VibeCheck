using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Entites;

namespace ReviewService.PersistentStorage.Repositories.Reviews;

internal sealed class ReviewsCommandRepository(AppDbContext dbContext) : IReviewsCommandRepository
{
    public async Task CreateReviewAsync(
        CreateReviewCommandRepositoryModel model,
        CancellationToken ct)
    {
        var review = new ReviewEntity
        {
            Id = model.ReviewId,
            CompanyId = model.CompanyId,
            AuthorId = model.AuthorId,
            Text = model.Text,
            LikesCount = 0,
            DislikesCount = 0,
            Score = 0,
            CreatedAt = model.CreatedAtUtc,
            UpdatedAt = model.CreatedAtUtc,
            DeletedAt = null
        };

        dbContext.Reviews.Add(review);

        foreach (var flagId in model.FlagIds.Distinct())
        {
            dbContext.ReviewFlags.Add(new ReviewFlagEntity
            {
                ReviewId = model.ReviewId,
                FlagId = flagId,
                CreatedAt = model.CreatedAtUtc
            });

            var companyFlag = await dbContext.CompanyFlags
                .FirstOrDefaultAsync(
                    x => x.CompanyId == model.CompanyId && x.FlagId == flagId,
                    ct);

            if (companyFlag is null)
            {
                dbContext.CompanyFlags.Add(new CompanyFlagEntity
                {
                    CompanyId = model.CompanyId,
                    FlagId = flagId,
                    ReviewsCount = 1,
                    UpdatedAt = model.CreatedAtUtc
                });
            }
            else
            {
                companyFlag.ReviewsCount += 1;
                companyFlag.UpdatedAt = model.CreatedAtUtc;
            }
        }

        await dbContext.SaveChangesAsync(ct);
    }

    public async Task UpdateReviewTextAsync(
        Guid reviewId,
        string? text,
        DateTime utcNow,
        CancellationToken ct)
    {
        var review = await dbContext.Reviews.FirstAsync(x => x.Id == reviewId, ct);

        review.Text = text;
        review.UpdatedAt = utcNow;

        await dbContext.SaveChangesAsync(ct);
    }

    public async Task SoftDeleteReviewAsync(
        Guid reviewId,
        DateTime utcNow,
        CancellationToken ct)
    {
        var review = await dbContext.Reviews.FirstAsync(x => x.Id == reviewId, ct);

        if (review.DeletedAt is not null)
            return;

        review.DeletedAt = utcNow;
        review.UpdatedAt = utcNow;

        var reviewFlagIds = await dbContext.ReviewFlags
            .Where(x => x.ReviewId == reviewId)
            .Select(x => x.FlagId)
            .ToListAsync(ct);

        foreach (var flagId in reviewFlagIds)
        {
            var companyFlag = await dbContext.CompanyFlags
                .FirstOrDefaultAsync(
                    x => x.CompanyId == review.CompanyId && x.FlagId == flagId,
                    ct);

            if (companyFlag is null)
                continue;

            companyFlag.ReviewsCount = Math.Max(0, companyFlag.ReviewsCount - 1);
            companyFlag.UpdatedAt = utcNow;
        }

        await dbContext.SaveChangesAsync(ct);
    }

    /// <returns>True if new vote; false otherwise</returns>
    public async Task<bool> UpsertVoteAsync(
        UpsertReviewVoteCommandRepositoryModel model,
        CancellationToken ct)
    {
        var voteIsNew = false;
        var vote = await dbContext.ReviewVotes
            .FirstOrDefaultAsync(
                x => x.ReviewId == model.ReviewId && x.VoterId == model.VoterId,
                ct);

        if (vote is null)
        {
            dbContext.ReviewVotes.Add(new ReviewVoteEntity
            {
                ReviewId = model.ReviewId,
                VoterId = model.VoterId,
                Mode = model.Mode,
                CreatedAt = model.UtcNow,
                UpdatedAt = model.UtcNow
            });
            voteIsNew = true;
        }
        else
        {
            vote.Mode = model.Mode;
            vote.UpdatedAt = model.UtcNow;
        }

        await dbContext.SaveChangesAsync(ct);

        return voteIsNew;
    }

    public async Task DeleteVoteAsync(
        Guid reviewId,
        Guid voterId,
        CancellationToken ct)
    {
        var vote = await dbContext.ReviewVotes
            .FirstOrDefaultAsync(
                x => x.ReviewId == reviewId && x.VoterId == voterId,
                ct);

        if (vote is null)
            return;

        dbContext.ReviewVotes.Remove(vote);
        await dbContext.SaveChangesAsync(ct);
    }

    public async Task RecalculateReviewScoreAsync(
        Guid reviewId,
        DateTime utcNow,
        CancellationToken ct)
    {
        var votes = await dbContext.ReviewVotes
            .AsNoTracking()
            .Where(x => x.ReviewId == reviewId)
            .ToListAsync(ct);

        var likes = votes.Count(x => x.Mode == "like");
        var dislikes = votes.Count(x => x.Mode == "dislike");

        var review = await dbContext.Reviews.FirstAsync(x => x.Id == reviewId, ct);

        review.LikesCount = likes;
        review.DislikesCount = dislikes;
        review.Score = likes - dislikes;
        review.UpdatedAt = utcNow;

        await dbContext.SaveChangesAsync(ct);
    }

    public async Task CreateReportAsync(
        CreateReviewReportCommandRepositoryModel model,
        CancellationToken ct)
    {
        dbContext.ReviewReports.Add(new ReviewReportEntity
        {
            Id = model.ReportId,
            ReviewId = model.ReviewId,
            ReporterId = model.ReporterId,
            ReasonType = model.ReasonType,
            ReasonText = model.ReasonText,
            CreatedAt = model.CreatedAtUtc
        });

        await dbContext.SaveChangesAsync(ct);
    }
}