using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Query;

public sealed class GetCompanyReviewsOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();
    private readonly IUserProfilesQueryRepository _userProfilesQueryRepository = Substitute.For<IUserProfilesQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenCompanyIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository, _userProfilesQueryRepository);

        var model = new GetCompanyReviewsOperationModel(
            CurrentUserId: Guid.NewGuid(),
            CompanyId: Guid.Empty,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("companyId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        _mapper.DidNotReceive().Map<GetCompanyReviewsRepositoryInputModel>(Arg.Any<GetCompanyReviewsOperationModel>());
        await _queryRepository.DidNotReceive().GetCompanyReviewsAsync(
            Arg.Any<GetCompanyReviewsRepositoryInputModel>(),
            Arg.Any<CancellationToken>());

        await _userProfilesQueryRepository.DidNotReceive().GetIconIdsByUserIdsAsync(
            Arg.Any<IReadOnlyCollection<Guid>>(),
            Arg.Any<CancellationToken>());

        await _userProfilesQueryRepository.DidNotReceive().GetProfilesForSimilarityByUserIdsAsync(
            Arg.Any<IReadOnlyCollection<Guid>>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository, _userProfilesQueryRepository);

        var model = new GetCompanyReviewsOperationModel(
            CurrentUserId: Guid.NewGuid(),
            CompanyId: Guid.NewGuid(),
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetCompanyReviewsRepositoryInputModel
        {
            CompanyId = model.CompanyId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        _mapper.Map<GetCompanyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetCompanyReviewsRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("company not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);

        _mapper.Received(1).Map<GetCompanyReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<CompanyReviewsPageOperationModel>(Arg.Any<GetCompanyReviewsRepositoryOutputModel>());

        await _userProfilesQueryRepository.DidNotReceive().GetIconIdsByUserIdsAsync(
            Arg.Any<IReadOnlyCollection<Guid>>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldEnrichAuthorIcons_AndReturnSuccess()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository, _userProfilesQueryRepository);

        var companyId = Guid.NewGuid();
        var reviewId1 = Guid.NewGuid();
        var reviewId2 = Guid.NewGuid();
        var authorId1 = Guid.NewGuid();
        var authorId2 = Guid.NewGuid();
        var flagId = Guid.NewGuid();

        var model = new GetCompanyReviewsOperationModel(
            CurrentUserId: Guid.NewGuid(),
            CompanyId: companyId,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetCompanyReviewsRepositoryInputModel
        {
            CompanyId = companyId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        var repoOutput = new GetCompanyReviewsRepositoryOutputModel
        {
            TotalCount = 2,
            Reviews =
            [
                new CompanyReviewRepositoryItemOutputModel
                {
                    ReviewId = reviewId1,
                    AuthorId = authorId1,
                    // в storage модели авторской иконки может не быть — мы её подтягиваем отдельно
                    Text = "review 1",
                    Score = 10,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Flags =
                    [
                        new FlagRepositoryModel
                        {
                            Id = flagId,
                            Name = "процессы"
                        }
                    ],
                    AuthorIconId = null
                },
                new CompanyReviewRepositoryItemOutputModel
                {
                    ReviewId = reviewId2,
                    AuthorId = authorId2,
                    Text = "review 2",
                    Score = -1,
                    CreatedAt = DateTimeOffset.UtcNow.AddMinutes(-5),
                    Flags =
                    [
                    ],
                    AuthorIconId = null
                }
            ]
        };

        // mapped page (до обогащения)
        var mapped = new CompanyReviewsPageOperationModel
        {
            TotalCount = 2,
            Reviews =
            [
                new CompanyReviewOperationModel
                {
                    ReviewId = reviewId1,
                    AuthorId = authorId1,
                    AuthorIconId = null, // будет обогащено
                    Text = "review 1",
                    Score = 10,
                    Weight = 0,
                    CreatedAt = repoOutput.Reviews[0].CreatedAt,
                    Flags =
                    [
                        new FlagOperationModel { Id = flagId, Name = "процессы" }
                    ]
                },
                new CompanyReviewOperationModel
                {
                    ReviewId = reviewId2,
                    AuthorId = authorId2,
                    AuthorIconId = null, // будет обогащено
                    Text = "review 2",
                    Score = -1,
                    Weight = 0,
                    CreatedAt = repoOutput.Reviews[1].CreatedAt,
                    Flags = []
                }
            ]
        };

        _mapper.Map<GetCompanyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<CompanyReviewsPageOperationModel>(repoOutput).Returns(mapped);

        var iconsDict = new Dictionary<Guid, string?>
        {
            [authorId1] = "usr_ava_anton",
            [authorId2] = "usr_ava_lena"
        };

        // важно: operation делает Distinct, поэтому проверяем, что оба автора в батче
        _userProfilesQueryRepository.GetIconIdsByUserIdsAsync(
                Arg.Is<IReadOnlyCollection<Guid>>(ids =>
                    ids.Count == 2 && ids.Contains(authorId1) && ids.Contains(authorId2)),
                Arg.Any<CancellationToken>())
            .Returns(iconsDict);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(2, result.Value.TotalCount);
        Assert.Equal("usr_ava_anton", result.Value.Reviews[0].AuthorIconId);
        Assert.Equal("usr_ava_lena", result.Value.Reviews[1].AuthorIconId);

        _mapper.Received(1).Map<GetCompanyReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<CompanyReviewsPageOperationModel>(repoOutput);

        await _userProfilesQueryRepository.Received(1).GetIconIdsByUserIdsAsync(
            Arg.Any<IReadOnlyCollection<Guid>>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenIconsRepositoryDoesNotReturnSomeUsers_ShouldLeaveAuthorIconIdNull()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository, _userProfilesQueryRepository);

        var companyId = Guid.NewGuid();
        var authorId1 = Guid.NewGuid();
        var authorId2 = Guid.NewGuid();

        var model = new GetCompanyReviewsOperationModel(
            CurrentUserId: Guid.NewGuid(),
            CompanyId: companyId,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetCompanyReviewsRepositoryInputModel
        {
            CompanyId = companyId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        var repoOutput = new GetCompanyReviewsRepositoryOutputModel
        {
            TotalCount = 2,
            Reviews =
            [
                new CompanyReviewRepositoryItemOutputModel
                {
                    ReviewId = Guid.NewGuid(),
                    AuthorId = authorId1,
                    Text = "review 1",
                    Score = 1,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Flags =
                    [
                    ],
                    AuthorIconId = null
                },
                new CompanyReviewRepositoryItemOutputModel
                {
                    ReviewId = Guid.NewGuid(),
                    AuthorId = authorId2,
                    Text = "review 2",
                    Score = 2,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Flags =
                    [
                    ],
                    AuthorIconId = null
                }
            ]
        };

        var mapped = new CompanyReviewsPageOperationModel
        {
            TotalCount = 2,
            Reviews =
            [
                new CompanyReviewOperationModel
                {
                    ReviewId = repoOutput.Reviews[0].ReviewId,
                    AuthorId = authorId1,
                    AuthorIconId = null,
                    Text = "review 1",
                    Score = 1,
                    Weight = 0,
                    CreatedAt = repoOutput.Reviews[0].CreatedAt,
                    Flags = []
                },
                new CompanyReviewOperationModel
                {
                    ReviewId = repoOutput.Reviews[1].ReviewId,
                    AuthorId = authorId2,
                    AuthorIconId = null,
                    Text = "review 2",
                    Score = 2,
                    Weight = 0,
                    CreatedAt = repoOutput.Reviews[1].CreatedAt,
                    Flags = []
                }
            ]
        };

        _mapper.Map<GetCompanyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<CompanyReviewsPageOperationModel>(repoOutput).Returns(mapped);

        // вернули иконку только для первого автора
        _userProfilesQueryRepository.GetIconIdsByUserIdsAsync(Arg.Any<IReadOnlyCollection<Guid>>(), Arg.Any<CancellationToken>())
            .Returns(new Dictionary<Guid, string?> { [authorId1] = "usr_ava_anton" });

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("usr_ava_anton", result.Value.Reviews[0].AuthorIconId);
        Assert.Null(result.Value.Reviews[1].AuthorIconId);
    }

    [Fact]
    public async Task GetAsync_WhenSortIsWeightDesc_ShouldCalculateWeightsAndSortByWeightDescending()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository, _userProfilesQueryRepository);

        var currentUserId = Guid.NewGuid();
        var companyId = Guid.NewGuid();
        var sharedFlagId = Guid.NewGuid();
        var closeAuthorId = Guid.NewGuid();
        var neutralAuthorId = Guid.NewGuid();
        var oppositeAuthorId = Guid.NewGuid();

        var model = new GetCompanyReviewsOperationModel(
            CurrentUserId: currentUserId,
            CompanyId: companyId,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.WeightDesc);

        var repoInput = new GetCompanyReviewsRepositoryInputModel
        {
            CompanyId = companyId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.WeightDesc
        };

        var repoOutput = new GetCompanyReviewsRepositoryOutputModel
        {
            TotalCount = 3,
            Reviews = []
        };

        var oppositeReviewId = Guid.NewGuid();
        var closeReviewId = Guid.NewGuid();
        var neutralReviewId = Guid.NewGuid();
        var mapped = new CompanyReviewsPageOperationModel
        {
            TotalCount = 3,
            Reviews =
            [
                CreateReview(oppositeReviewId, oppositeAuthorId, new DateTimeOffset(2026, 1, 3, 0, 0, 0, TimeSpan.Zero)),
                CreateReview(closeReviewId, closeAuthorId, new DateTimeOffset(2026, 1, 2, 0, 0, 0, TimeSpan.Zero)),
                CreateReview(neutralReviewId, neutralAuthorId, new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero))
            ]
        };

        _mapper.Map<GetCompanyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyReviewsForWeightAsync(companyId, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<CompanyReviewsPageOperationModel>(repoOutput).Returns(mapped);
        _userProfilesQueryRepository.GetProfilesForSimilarityByUserIdsAsync(
                Arg.Is<IReadOnlyCollection<Guid>>(ids =>
                    ids.Count == 4
                    && ids.Contains(currentUserId)
                    && ids.Contains(closeAuthorId)
                    && ids.Contains(neutralAuthorId)
                    && ids.Contains(oppositeAuthorId)),
                Arg.Any<CancellationToken>())
            .Returns(CreateProfiles(currentUserId, closeAuthorId, neutralAuthorId, oppositeAuthorId, sharedFlagId));

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal([closeReviewId, neutralReviewId, oppositeReviewId], result.Value.Reviews.Select(x => x.ReviewId));
        Assert.Equal("close_icon", result.Value.Reviews[0].AuthorIconId);
        Assert.True(result.Value.Reviews[0].Weight > result.Value.Reviews[1].Weight);
        Assert.True(result.Value.Reviews[1].Weight > result.Value.Reviews[2].Weight);

        await _userProfilesQueryRepository.DidNotReceive().GetIconIdsByUserIdsAsync(
            Arg.Any<IReadOnlyCollection<Guid>>(),
            Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenSortIsWeightAsc_ShouldCalculateWeightsAndSortByWeightAscending()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository, _userProfilesQueryRepository);

        var currentUserId = Guid.NewGuid();
        var companyId = Guid.NewGuid();
        var sharedFlagId = Guid.NewGuid();
        var closeAuthorId = Guid.NewGuid();
        var neutralAuthorId = Guid.NewGuid();
        var oppositeAuthorId = Guid.NewGuid();

        var model = new GetCompanyReviewsOperationModel(
            CurrentUserId: currentUserId,
            CompanyId: companyId,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.WeightAsc);

        var repoInput = new GetCompanyReviewsRepositoryInputModel
        {
            CompanyId = companyId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.WeightAsc
        };

        var repoOutput = new GetCompanyReviewsRepositoryOutputModel
        {
            TotalCount = 3,
            Reviews = []
        };

        var oppositeReviewId = Guid.NewGuid();
        var closeReviewId = Guid.NewGuid();
        var neutralReviewId = Guid.NewGuid();
        var mapped = new CompanyReviewsPageOperationModel
        {
            TotalCount = 3,
            Reviews =
            [
                CreateReview(closeReviewId, closeAuthorId, new DateTimeOffset(2026, 1, 3, 0, 0, 0, TimeSpan.Zero)),
                CreateReview(neutralReviewId, neutralAuthorId, new DateTimeOffset(2026, 1, 2, 0, 0, 0, TimeSpan.Zero)),
                CreateReview(oppositeReviewId, oppositeAuthorId, new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero))
            ]
        };

        _mapper.Map<GetCompanyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyReviewsForWeightAsync(companyId, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<CompanyReviewsPageOperationModel>(repoOutput).Returns(mapped);
        _userProfilesQueryRepository.GetProfilesForSimilarityByUserIdsAsync(
                Arg.Any<IReadOnlyCollection<Guid>>(),
                Arg.Any<CancellationToken>())
            .Returns(CreateProfiles(currentUserId, closeAuthorId, neutralAuthorId, oppositeAuthorId, sharedFlagId));

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal([oppositeReviewId, neutralReviewId, closeReviewId], result.Value.Reviews.Select(x => x.ReviewId));
        Assert.True(result.Value.Reviews[0].Weight < result.Value.Reviews[1].Weight);
        Assert.True(result.Value.Reviews[1].Weight < result.Value.Reviews[2].Weight);
    }

    private static CompanyReviewOperationModel CreateReview(
        Guid reviewId,
        Guid authorId,
        DateTimeOffset createdAt)
    {
        return new CompanyReviewOperationModel
        {
            ReviewId = reviewId,
            AuthorId = authorId,
            AuthorIconId = null,
            Text = "review",
            Score = 0,
            Weight = 0,
            CreatedAt = createdAt,
            Flags = []
        };
    }

    private static IReadOnlyDictionary<Guid, UserProfileForSimilarityRepositoryModel> CreateProfiles(
        Guid currentUserId,
        Guid closeAuthorId,
        Guid neutralAuthorId,
        Guid oppositeAuthorId,
        Guid sharedFlagId)
    {
        return new Dictionary<Guid, UserProfileForSimilarityRepositoryModel>
        {
            [currentUserId] = CreateProfile(
                currentUserId,
                iconId: "current_icon",
                specialization: SpecializationRepositoryEnum.Backend,
                education: EducationLevelRepositoryEnum.Bachelor,
                birthday: new DateTime(1995, 1, 1),
                flags:
                [
                    CreateFlag(sharedFlagId, UserProfileFlagColorRepositoryEnum.Green, 3)
                ]),
            [closeAuthorId] = CreateProfile(
                closeAuthorId,
                iconId: "close_icon",
                specialization: SpecializationRepositoryEnum.Backend,
                education: EducationLevelRepositoryEnum.Bachelor,
                birthday: new DateTime(1996, 1, 1),
                flags:
                [
                    CreateFlag(sharedFlagId, UserProfileFlagColorRepositoryEnum.Green, 3)
                ]),
            [neutralAuthorId] = CreateProfile(
                neutralAuthorId,
                iconId: "neutral_icon",
                specialization: SpecializationRepositoryEnum.Frontend,
                education: EducationLevelRepositoryEnum.Master,
                birthday: new DateTime(1980, 1, 1),
                flags: []),
            [oppositeAuthorId] = CreateProfile(
                oppositeAuthorId,
                iconId: "opposite_icon",
                specialization: SpecializationRepositoryEnum.Backend,
                education: EducationLevelRepositoryEnum.Bachelor,
                birthday: new DateTime(1995, 1, 1),
                flags:
                [
                    CreateFlag(sharedFlagId, UserProfileFlagColorRepositoryEnum.Red, 3)
                ])
        };
    }

    private static UserProfileForSimilarityRepositoryModel CreateProfile(
        Guid userId,
        string iconId,
        SpecializationRepositoryEnum specialization,
        EducationLevelRepositoryEnum education,
        DateTime birthday,
        IReadOnlyList<UserProfileFlagForSimilarityRepositoryModel> flags)
    {
        return new UserProfileForSimilarityRepositoryModel
        {
            UserId = userId,
            IconId = iconId,
            Birthday = birthday,
            Education = education,
            Specialization = specialization,
            WorkExperience =
            [
                new UserWorkExperienceForSimilarityRepositoryModel
                {
                    Specialization = specialization,
                    StartedAt = new DateTime(2020, 1, 1),
                    FinishedAt = new DateTime(2025, 1, 1)
                }
            ],
            Flags = flags
        };
    }

    private static UserProfileFlagForSimilarityRepositoryModel CreateFlag(
        Guid flagId,
        UserProfileFlagColorRepositoryEnum color,
        int weight)
    {
        return new UserProfileFlagForSimilarityRepositoryModel
        {
            FlagId = flagId,
            Color = color,
            Weight = weight
        };
    }
}
