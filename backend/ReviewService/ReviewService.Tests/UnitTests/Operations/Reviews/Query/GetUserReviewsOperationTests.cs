using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetUserReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Query;

public sealed class GetUserReviewsOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new GetUserReviewsOperation(_mapper, _queryRepository);

        var model = new GetUserReviewsOperationModel(
            UserId: Guid.Empty,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        _mapper.DidNotReceive().Map<GetUserReviewsRepositoryInputModel>(Arg.Any<GetUserReviewsOperationModel>());
        await _queryRepository.DidNotReceive().GetUserReviewsAsync(Arg.Any<GetUserReviewsRepositoryInputModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound()
    {
        // Arrange
        var operation = new GetUserReviewsOperation(_mapper, _queryRepository);

        var model = new GetUserReviewsOperationModel(
            UserId: Guid.NewGuid(),
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetUserReviewsRepositoryInputModel
        {
            UserId = model.UserId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        _mapper.Map<GetUserReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetUserReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetUserReviewsRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("user not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);

        _mapper.Received(1).Map<GetUserReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetUserReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<UserReviewsPageOperationModel>(Arg.Any<GetUserReviewsRepositoryOutputModel>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldReturnSuccess()
    {
        // Arrange
        var operation = new GetUserReviewsOperation(_mapper, _queryRepository);

        var userId = Guid.NewGuid();
        var companyId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();
        var flagId = Guid.NewGuid();

        var model = new GetUserReviewsOperationModel(
            UserId: userId,
            Take: 20,
            PageNum: 1,
            Sort: ReviewsSortOperationEnum.Newest);

        var repoInput = new GetUserReviewsRepositoryInputModel
        {
            UserId = userId,
            Take = 20,
            PageNum = 1,
            Sort = PersistentStorage.Abstractions.Enums.ReviewsSortRepositoryEnum.Newest
        };

        var repoOutput = new GetUserReviewsRepositoryOutputModel
        {
            TotalCount = 1,
            Reviews =
            [
                new UserReviewRepositoryItemOutputModel
                {
                    ReviewId = reviewId,
                    CompanyId = companyId,
                    AuthorId = null,
                    Text = "интересные задачи и сильные коллеги, но ритм местами тяжёлый",
                    Score = 7,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Flags =
                    [
                        new FlagRepositoryModel
                        {
                            Id = flagId,
                            Name = "сильная команда"
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
                    Text = "интересные задачи и сильные коллеги, но ритм местами тяжёлый",
                    Score = 7,
                    CreatedAt = repoOutput.Reviews[0].CreatedAt,
                    Flags =
                    [
                        new FlagOperationModel
                        {
                            Id = flagId,
                            Name = "сильная команда"
                        }
                    ]
                }
            ]
        };

        _mapper.Map<GetUserReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetUserReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<UserReviewsPageOperationModel>(repoOutput).Returns(expected);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.TotalCount);
        Assert.Single(result.Value.Reviews);
        Assert.Equal(reviewId, result.Value.Reviews[0].ReviewId);

        _mapper.Received(1).Map<GetUserReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetUserReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<UserReviewsPageOperationModel>(repoOutput);
    }
}