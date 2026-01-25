namespace ReviewService.Core.Abstractions.Models;

public enum ReviewsSortOperationEnum
{
    Newest = 0,
    Oldest = 1,
    BestScore = 2,
    WorstScore = 3,
    WeightDesc = 4,
    WeightAsc = 5
}

public enum VoteModeOperationEnum
{
    Like = 0,
    Dislike = 1,
    Clear = 2
}

public enum ReportReasonTypeOperationEnum
{
    Spam = 0,
    Harassment = 1,
    Hate = 2,
    Nudity = 3,
    Violence = 4,
    Other = 99
}

// -------------------------
// command models (write)
// -------------------------

public sealed record CreateCompanyReviewOperationModel
{
    public required Guid CompanyId { get; init; }
    public string? Text { get; init; }
    public required long[] Flags { get; init; } // max 10 — валидируй в домене/операции
}

public sealed record UpdateCompanyReviewOperationModel
{
    public required Guid ReviewId { get; init; } // задаём в контроллере из route
    public required Guid UserId { get; init; }
    public string? Text { get; init; }
}

public sealed record DeleteCompanyReviewOperationModel
{
    public required Guid ReviewId { get; init; } // задаём в контроллере из route
    public required Guid UserId { get; init; }
}

public sealed record VoteReviewOperationModel
{
    public required Guid ReviewId { get; init; } // задаём в контроллере из route
    public required VoteModeOperationEnum ModeOperationEnum { get; init; }
}

public sealed record ReportReviewOperationModel
{
    public required Guid ReviewId { get; init; } // задаём в контроллере из route
    public required ReportReasonTypeOperationEnum ReasonTypeOperationEnum { get; init; }
    public string? ReasonText { get; init; }
}

// -------------------------
// query models (read)
// -------------------------

public sealed record GetCompanyReviewsOperationModel(
    Guid CompanyId,
    int Take,
    int PageNum,
    ReviewsSortOperationEnum SortOperationEnum);

public sealed record GetMyReviewsOperationModel(
    int Take,
    int PageNum,
    ReviewsSortOperationEnum SortOperationEnum);

public sealed record GetUserReviewsOperationModel(
    Guid UserId,
    int Take,
    int PageNum,
    ReviewsSortOperationEnum SortOperationEnum);

// -------------------------
// read models (операции возвращают это; gateway уже маппит в свои response dto)
// -------------------------

public sealed record CompanyReviewsPageModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<CompanyReviewReadModel> Reviews { get; init; }
}

public sealed record UserReviewsPageModel
{
    public required long TotalCount { get; init; }
    public required IReadOnlyList<UserReviewReadModel> Reviews { get; init; }
}

public sealed record CompanyReviewReadModel
{
    public required double Weight { get; init; }
    public required Guid ReviewId { get; init; }
    public required Guid AuthorId { get; init; }
    public required string IconId { get; init; }
    public required string Text { get; init; }
    public required long Score { get; init; } // likes - dislikes
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagReadModel> Flags { get; init; }
}

public sealed record UserReviewReadModel
{
    public required Guid ReviewId { get; init; }

    // в спеках были (remove?) — оставляю опциональными, чтобы не ломать контракты.
    public Guid? AuthorId { get; init; }
    public Guid? CompanyId { get; init; }

    public required string Text { get; init; }
    public required long Score { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required IReadOnlyList<FlagReadModel> Flags { get; init; }
}

public sealed record FlagReadModel
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
}