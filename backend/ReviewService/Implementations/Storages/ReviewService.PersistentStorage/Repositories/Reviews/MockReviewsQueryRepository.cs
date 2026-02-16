using ReviewService.PersistentStorage.Abstractions.Enums;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.PersistentStorage.Repositories.Reviews;

/// <summary>
/// мок-репозиторий отзывов: хардкод, пагинация и сортировки.
/// </summary>
internal sealed class MockReviewsQueryRepository : IReviewsQueryRepository
{
    private static readonly Guid Company1 = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private static readonly Guid Company2 = Guid.Parse("22222222-2222-2222-2222-222222222222");

    private static readonly Guid User1 = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
    private static readonly Guid User2 = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

    private static readonly List<ReviewRecord> Reviews =
    [
        new(
            ReviewId: Guid.Parse("10101010-1010-1010-1010-101010101010"),
            CompanyId: Company1,
            AuthorId: User1,
            IconId: "ic_user_1",
            Text: "сильная команда, но процессы местами сыроваты",
            Score: 12,
            Weight: 0.88,
            CreatedAt: DateTimeOffset.Parse("2026-02-10T12:00:00+00:00"),
            Flags:
            [
                new(Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"), "техстек" ),
                new(Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), "процессы" )
            ]),

        new(
            ReviewId: Guid.Parse("20202020-2020-2020-2020-202020202020"),
            CompanyId: Company1,
            AuthorId: User2,
            IconId: "ic_user_2",
            Text: "культура отличная, но зарплаты ниже рынка",
            Score: 3,
            Weight: 0.55,
            CreatedAt: DateTimeOffset.Parse("2026-02-12T09:30:00+00:00"),
            Flags:
            [
                new(Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"), "культура" ),
                new( Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"), "зарплата" )
            ]),

        new(
            ReviewId: Guid.Parse("30303030-3030-3030-3030-303030303030"),
            CompanyId: Company2,
            AuthorId: User1,
            IconId: "ic_user_1",
            Text: "много легаси, зато стабильность",
            Score: -2,
            Weight: 0.31,
            CreatedAt: DateTimeOffset.Parse("2026-01-20T18:10:00+00:00"),
            Flags:
            [
                new (Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"), "процессы" )
            ])
    ];

    public Task<GetCompanyReviewsRepositoryOutputModel?> GetCompanyReviewsAsync(
        GetCompanyReviewsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // "company not found" — если нет ни одного отзыва по компании
        var companyReviews = Reviews.Where(r => r.CompanyId == input.CompanyId).ToList();
        if (companyReviews.Count == 0)
            return Task.FromResult<GetCompanyReviewsRepositoryOutputModel?>(null);

        var sorted = SortCompany(companyReviews, input.Sort);

        var total = sorted.LongCount();
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = sorted.Skip(skip).Take(take).ToList();

        GetCompanyReviewsRepositoryOutputModel output = new()
        {
            TotalCount = total,
            Reviews = page.Select(r => new CompanyReviewRepositoryItemOutputModel
            {
                Weight = r.Weight,
                ReviewId = r.ReviewId,
                AuthorId = r.AuthorId,
                IconId = r.IconId,
                Text = r.Text,
                Score = r.Score,
                CreatedAt = r.CreatedAt,
                Flags = r.Flags.Select(f => new FlagRepositoryModel { Id = f.Id, Name = f.Name }).ToList()
            }).ToList()
        };

        return Task.FromResult<GetCompanyReviewsRepositoryOutputModel?>(output);
    }

    public Task<GetMyReviewsRepositoryOutputModel?> GetMyReviewsAsync(
        GetMyReviewsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // для me: null можно использовать как "какая-то проблема", но у мока пусть всегда возвращает страницу
        var my = Reviews.Where(r => r.AuthorId == input.CurrentUserId).ToList();

        var sorted = SortUser(my, input.Sort);

        var total = sorted.LongCount();
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = sorted.Skip(skip).Take(take).ToList();

        GetMyReviewsRepositoryOutputModel output = new()
        {
            TotalCount = total,
            Reviews = page.Select(r => new UserReviewRepositoryItemOutputModel
            {
                ReviewId = r.ReviewId,
                CompanyId = r.CompanyId, // в спеках у тебя "remove?" — но хранилище может отдать, а dto уже решит
                AuthorId = null,
                Text = r.Text,
                Score = r.Score,
                CreatedAt = r.CreatedAt,
                Flags = r.Flags.Select(f => new FlagRepositoryModel { Id = f.Id, Name = f.Name }).ToList()
            }).ToList()
        };

        return Task.FromResult<GetMyReviewsRepositoryOutputModel?>(output);
    }

    public Task<GetUserReviewsRepositoryOutputModel?> GetUserReviewsAsync(
        GetUserReviewsRepositoryInputModel input,
        CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // user not found — если Guid.Empty или нет отзывов (для мока достаточно)
        if (input.UserId == Guid.Empty)
            return Task.FromResult<GetUserReviewsRepositoryOutputModel?>(null);

        var user = Reviews.Where(r => r.AuthorId == input.UserId).ToList();
        if (user.Count == 0)
            return Task.FromResult<GetUserReviewsRepositoryOutputModel?>(null);

        var sorted = SortUser(user, input.Sort);

        var total = sorted.LongCount();
        var take = ClampInt(input.Take, 1, 100);
        var pageNum = Math.Max(1, input.PageNum);
        var skip = (pageNum - 1) * take;

        var page = sorted.Skip(skip).Take(take).ToList();

        GetUserReviewsRepositoryOutputModel output = new()
        {
            TotalCount = total,
            Reviews = page.Select(r => new UserReviewRepositoryItemOutputModel
            {
                ReviewId = r.ReviewId,
                CompanyId = r.CompanyId,
                AuthorId = null,
                Text = r.Text,
                Score = r.Score,
                CreatedAt = r.CreatedAt,
                Flags = r.Flags.Select(f => new FlagRepositoryModel { Id = f.Id, Name = f.Name }).ToList()
            }).ToList()
        };

        return Task.FromResult<GetUserReviewsRepositoryOutputModel?>(output);
    }

    private static IEnumerable<ReviewRecord> SortCompany(IEnumerable<ReviewRecord> src, ReviewsSortRepositoryEnum sort) =>
        sort switch
        {
            ReviewsSortRepositoryEnum.Newest => src.OrderByDescending(x => x.CreatedAt),
            ReviewsSortRepositoryEnum.Oldest => src.OrderBy(x => x.CreatedAt),
            ReviewsSortRepositoryEnum.BestScore => src.OrderByDescending(x => x.Score),
            ReviewsSortRepositoryEnum.WorstScore => src.OrderBy(x => x.Score),
            ReviewsSortRepositoryEnum.WeightDesc => src.OrderByDescending(x => x.Weight),
            ReviewsSortRepositoryEnum.WeightAsc => src.OrderBy(x => x.Weight),
            _ => src.OrderByDescending(x => x.CreatedAt)
        };

    // для user-выдач weight может быть не показан, но сортировать по нему можно.
    private static IEnumerable<ReviewRecord> SortUser(IEnumerable<ReviewRecord> src, ReviewsSortRepositoryEnum sort) =>
        sort switch
        {
            ReviewsSortRepositoryEnum.Newest => src.OrderByDescending(x => x.CreatedAt),
            ReviewsSortRepositoryEnum.Oldest => src.OrderBy(x => x.CreatedAt),
            ReviewsSortRepositoryEnum.BestScore => src.OrderByDescending(x => x.Score),
            ReviewsSortRepositoryEnum.WorstScore => src.OrderBy(x => x.Score),
            ReviewsSortRepositoryEnum.WeightDesc => src.OrderByDescending(x => x.Weight),
            ReviewsSortRepositoryEnum.WeightAsc => src.OrderBy(x => x.Weight),
            _ => src.OrderByDescending(x => x.CreatedAt)
        };

    private static int ClampInt(int value, int min, int max) =>
        value < min ? min : value > max ? max : value;

    private sealed record ReviewRecord(
        Guid ReviewId,
        Guid CompanyId,
        Guid AuthorId,
        string IconId,
        string Text,
        long Score,
        double Weight,
        DateTimeOffset CreatedAt,
        IReadOnlyList<FlagRecord> Flags);

    private sealed record FlagRecord(Guid Id, string Name);
}