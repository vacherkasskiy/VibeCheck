using Microsoft.EntityFrameworkCore;
using ReviewService.PersistentStorage.Abstractions.Enums;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Entites;

namespace ReviewService.PersistentStorage.Repositories.Reviews;

internal sealed class ReviewsQueryRepository(AppDbContext dbContext) : IReviewsQueryRepository
{
    public async Task<GetCompanyReviewsRepositoryOutputModel?> GetCompanyReviewsAsync(
        GetCompanyReviewsRepositoryInputModel input,
        CancellationToken ct)
    {
        var companyExists = await CompanyExistsAsync(input.CompanyId, ct);
        if (!companyExists)
            return null;

        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        IQueryable<ReviewEntity> query = dbContext.Reviews
            .AsNoTracking()
            .Where(x => x.CompanyId == input.CompanyId && x.DeletedAt == null);

        query = ApplySort(query, input.Sort);

        var totalCount = await query.LongCountAsync(ct);

        var reviews = await query
            .Skip(skip)
            .Take(take)
            .Select(x => new
            {
                x.Id,
                x.AuthorId,
                AuthorIconId = x.Author.IconId,
                x.Text,
                x.Score,
                x.CreatedAt
            })
            .ToListAsync(ct);

        var reviewIds = reviews.Select(x => x.Id).ToArray();

        var flagsRaw = await dbContext.ReviewFlags
            .AsNoTracking()
            .Where(x => reviewIds.Contains(x.ReviewId))
            .OrderBy(x => x.Flag.Name)
            .Select(x => new
            {
                x.ReviewId,
                Flag = new FlagRepositoryModel
                {
                    Id = x.FlagId,
                    Name = x.Flag.Name
                }
            })
            .ToListAsync(ct);

        var flagsByReviewId = flagsRaw
            .GroupBy(x => x.ReviewId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<FlagRepositoryModel>)g.Select(x => x.Flag).ToList());

        var items = reviews
            .Select(x => new CompanyReviewRepositoryItemOutputModel
            {
                ReviewId = x.Id,
                AuthorId = x.AuthorId,
                AuthorIconId = x.AuthorIconId,
                Text = x.Text,
                Score = x.Score,
                CreatedAt = ToDateTimeOffsetUtc(x.CreatedAt),
                Flags = flagsByReviewId.GetValueOrDefault(x.Id, Array.Empty<FlagRepositoryModel>())
            })
            .ToList();

        return new GetCompanyReviewsRepositoryOutputModel
        {
            TotalCount = totalCount,
            Reviews = items
        };
    }

    public async Task<GetMyReviewsRepositoryOutputModel?> GetMyReviewsAsync(
        GetMyReviewsRepositoryInputModel input,
        CancellationToken ct)
    {
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.Reviews
            .AsNoTracking()
            .Where(x => x.AuthorId == input.CurrentUserId && x.DeletedAt == null);

        query = ApplySort(query, input.Sort);

        var totalCount = await query.LongCountAsync(ct);

        var reviews = await query
            .Skip(skip)
            .Take(take)
            .Select(x => new
            {
                x.Id,
                x.CompanyId,
                x.AuthorId,
                x.Text,
                x.Score,
                x.CreatedAt
            })
            .ToListAsync(ct);

        var reviewIds = reviews.Select(x => x.Id).ToArray();

        var flagsRaw = await dbContext.ReviewFlags
            .AsNoTracking()
            .Where(x => reviewIds.Contains(x.ReviewId))
            .OrderBy(x => x.Flag.Name)
            .Select(x => new
            {
                x.ReviewId,
                Flag = new FlagRepositoryModel
                {
                    Id = x.FlagId,
                    Name = x.Flag.Name
                }
            })
            .ToListAsync(ct);

        var flagsByReviewId = flagsRaw
            .GroupBy(x => x.ReviewId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<FlagRepositoryModel>)g.Select(x => x.Flag).ToList());

        var items = reviews
            .Select(x => new UserReviewRepositoryItemOutputModel
            {
                ReviewId = x.Id,
                CompanyId = x.CompanyId,
                AuthorId = x.AuthorId,
                Text = x.Text,
                Score = x.Score,
                CreatedAt = ToDateTimeOffsetUtc(x.CreatedAt),
                Flags = flagsByReviewId.GetValueOrDefault(x.Id, Array.Empty<FlagRepositoryModel>())
            })
            .ToList();

        return new GetMyReviewsRepositoryOutputModel
        {
            TotalCount = totalCount,
            Reviews = items
        };
    }

    public async Task<GetUserReviewsRepositoryOutputModel?> GetUserReviewsAsync(
        GetUserReviewsRepositoryInputModel input,
        CancellationToken ct)
    {
        var userExists = await dbContext.UserProfiles
            .AsNoTracking()
            .AnyAsync(x => x.UserId == input.UserId, ct);

        if (!userExists)
            return null;

        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var query = dbContext.Reviews
            .AsNoTracking()
            .Where(x => x.AuthorId == input.UserId && x.DeletedAt == null);

        query = ApplySort(query, input.Sort);

        var totalCount = await query.LongCountAsync(ct);

        var reviews = await query
            .Skip(skip)
            .Take(take)
            .Select(x => new
            {
                x.Id,
                x.CompanyId,
                x.AuthorId,
                x.Text,
                x.Score,
                x.CreatedAt
            })
            .ToListAsync(ct);

        var reviewIds = reviews.Select(x => x.Id).ToArray();

        var flagsRaw = await dbContext.ReviewFlags
            .AsNoTracking()
            .Where(x => reviewIds.Contains(x.ReviewId))
            .OrderBy(x => x.Flag.Name)
            .Select(x => new
            {
                x.ReviewId,
                Flag = new FlagRepositoryModel
                {
                    Id = x.FlagId,
                    Name = x.Flag.Name
                }
            })
            .ToListAsync(ct);

        var flagsByReviewId = flagsRaw
            .GroupBy(x => x.ReviewId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyList<FlagRepositoryModel>)g.Select(x => x.Flag).ToList());

        var items = reviews
            .Select(x => new UserReviewRepositoryItemOutputModel
            {
                ReviewId = x.Id,
                CompanyId = x.CompanyId,
                AuthorId = x.AuthorId,
                Text = x.Text,
                Score = x.Score,
                CreatedAt = ToDateTimeOffsetUtc(x.CreatedAt),
                Flags = flagsByReviewId.GetValueOrDefault(x.Id, Array.Empty<FlagRepositoryModel>())
            })
            .ToList();

        return new GetUserReviewsRepositoryOutputModel
        {
            TotalCount = totalCount,
            Reviews = items
        };
    }

    public Task<bool> CompanyExistsAsync(Guid companyId, CancellationToken ct) =>
        dbContext.Companies
            .AsNoTracking()
            .AnyAsync(x => x.Id == companyId, ct);

    public Task<bool> ReviewExistsAsync(Guid reviewId, CancellationToken ct) =>
        dbContext.Reviews
            .AsNoTracking()
            .AnyAsync(x => x.Id == reviewId, ct);

    public async Task<bool> AllFlagsExistAsync(IReadOnlyCollection<Guid> flagIds, CancellationToken ct)
    {
        var distinctIds = flagIds.Distinct().ToArray();

        var count = await dbContext.Flags
            .AsNoTracking()
            .CountAsync(x => distinctIds.Contains(x.Id), ct);

        return count == distinctIds.Length;
    }

    public Task<ReviewOwnershipRepositoryModel?> GetReviewOwnershipAsync(Guid reviewId, CancellationToken ct) =>
        dbContext.Reviews
            .AsNoTracking()
            .Where(x => x.Id == reviewId)
            .Select(x => new ReviewOwnershipRepositoryModel
            {
                ReviewId = x.Id,
                AuthorId = x.AuthorId,
                IsDeleted = x.DeletedAt != null
            })
            .FirstOrDefaultAsync(ct);

    public Task<ReviewEditInfoRepositoryModel?> GetReviewEditInfoAsync(Guid reviewId, CancellationToken ct) =>
        dbContext.Reviews
            .AsNoTracking()
            .Where(x => x.Id == reviewId)
            .Select(x => new ReviewEditInfoRepositoryModel
            {
                ReviewId = x.Id,
                AuthorId = x.AuthorId,
                CreatedAtUtc = x.CreatedAt,
                IsDeleted = x.DeletedAt != null
            })
            .FirstOrDefaultAsync(ct);

    public Task<bool> ReportAlreadyExistsAsync(
        Guid reviewId,
        Guid reporterId,
        string reasonType,
        CancellationToken ct) =>
        dbContext.ReviewReports
            .AsNoTracking()
            .AnyAsync(
                x => x.ReviewId == reviewId &&
                     x.ReporterId == reporterId &&
                     x.ReasonType == reasonType,
                ct);

    // todo implement weight asc/desc
    private static IQueryable<ReviewEntity> ApplySort(
        IQueryable<ReviewEntity> query,
        ReviewsSortRepositoryEnum sort)
    {
        return sort switch
        {
            ReviewsSortRepositoryEnum.Newest => query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            ReviewsSortRepositoryEnum.Oldest => query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id),
            ReviewsSortRepositoryEnum.BestScore => query.OrderByDescending(x => x.Score).ThenByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            ReviewsSortRepositoryEnum.WorstScore => query.OrderBy(x => x.Score).ThenByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            ReviewsSortRepositoryEnum.WeightDesc => query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            ReviewsSortRepositoryEnum.WeightAsc => query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id),
            _ => query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id)
        };
    }

    private static int ClampInt(int value, int min, int max) =>
        value < min ? min : value > max ? max : value;

    private static DateTimeOffset ToDateTimeOffsetUtc(DateTime value) =>
        value.Kind switch
        {
            DateTimeKind.Utc => new DateTimeOffset(value),
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc))
        };
}