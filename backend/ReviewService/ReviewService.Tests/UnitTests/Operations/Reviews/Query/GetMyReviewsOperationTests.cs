using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetMyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Query;

public sealed class GetMyReviewsOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenCurrentUserIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new GetMyReviewsOperation(_mapper, _queryRepository);

        var model = new GetMyReviewsOperationModel(
            CurrentUserId: Guid.Empty,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("currentUserId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        _mapper.DidNotReceive().Map<GetMyReviewsRepositoryInputModel>(Arg.Any<GetMyReviewsOperationModel>());
        await _queryRepository.DidNotReceive().GetMyReviewsAsync(Arg.Any<GetMyReviewsRepositoryInputModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnFailure()
    {
        // Arrange
        var operation = new GetMyReviewsOperation(_mapper, _queryRepository);

        var model = new GetMyReviewsOperationModel(
            CurrentUserId: Guid.NewGuid(),
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetMyReviewsRepositoryInputModel
        {
            CurrentUserId = model.CurrentUserId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        _mapper.Map<GetMyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetMyReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetMyReviewsRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("failed to load my reviews", result.Error.Message);
        Assert.Equal(ErrorType.Failure, result.Error.Type);

        _mapper.Received(1).Map<GetMyReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetMyReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<UserReviewsPageOperationModel>(Arg.Any<GetMyReviewsRepositoryOutputModel>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldReturnSuccess()
    {
        // Arrange
        var operation = new GetMyReviewsOperation(_mapper, _queryRepository);

        var currentUserId = Guid.NewGuid();
        var companyId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();
        var flagId = Guid.NewGuid();

        var model = new GetMyReviewsOperationModel(
            CurrentUserId: currentUserId,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetMyReviewsRepositoryInputModel
        {
            CurrentUserId = currentUserId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        var repoOutput = new GetMyReviewsRepositoryOutputModel
        {
            TotalCount = 1,
            Reviews =
            [
                new UserReviewRepositoryItemOutputModel
                {
                    ReviewId = reviewId,
                    CompanyId = companyId,
                    AuthorId = null,
                    Text = "компания быстро растёт, но процессы не всегда успевают за масштабом",
                    Score = 5,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Flags =
                    [
                        new FlagRepositoryModel
                        {
                            Id = flagId,
                            Name = "компания растёт"
                        }
                    ]
                }
            ]
        };

        var expected = new UserReviewsPageOperationModel
        {
            TotalCount = 1,
            Reviews =
            [
                new UserReviewReadOperationModel
                {
                    ReviewId = reviewId,
                    CompanyId = companyId,
                    AuthorId = null,
                    Text = "компания быстро растёт, но процессы не всегда успевают за масштабом",
                    Score = 5,
                    CreatedAt = repoOutput.Reviews[0].CreatedAt,
                    Flags =
                    [
                        new FlagOperationModel
                        {
                            Id = flagId,
                            Name = "компания растёт"
                        }
                    ]
                }
            ]
        };

        _mapper.Map<GetMyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetMyReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<UserReviewsPageOperationModel>(repoOutput).Returns(expected);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.TotalCount);
        Assert.Single(result.Value.Reviews);
        Assert.Equal(reviewId, result.Value.Reviews[0].ReviewId);

        _mapper.Received(1).Map<GetMyReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetMyReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<UserReviewsPageOperationModel>(repoOutput);
    }
}