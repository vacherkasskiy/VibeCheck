using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Enums;
using ReviewService.Core.Abstractions.Models.Reviews;
using ReviewService.Core.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.GetCompanyReviews;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Query;

public sealed class GetCompanyReviewsOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenCompanyIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository);

        var model = new GetCompanyReviewsOperationModel(
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
        await _queryRepository.DidNotReceive().GetCompanyReviewsAsync(Arg.Any<GetCompanyReviewsRepositoryInputModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository);

        var model = new GetCompanyReviewsOperationModel(
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
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldReturnSuccess()
    {
        // Arrange
        var operation = new GetCompanyReviewsOperation(_mapper, _queryRepository);

        var companyId = Guid.NewGuid();
        var reviewId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var flagId = Guid.NewGuid();

        var model = new GetCompanyReviewsOperationModel(
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
            TotalCount = 1,
            Reviews =
            [
                new CompanyReviewRepositoryItemOutputModel
                {
                    ReviewId = reviewId,
                    AuthorId = authorId,
                    IconId = "ic_user_1",
                    Text = "сильная команда, но процессы местами сыроваты",
                    Score = 12,
                    CreatedAt = DateTimeOffset.UtcNow,
                    Flags =
                    [
                        new FlagRepositoryModel
                        {
                            Id = flagId,
                            Name = "процессы"
                        }
                    ]
                }
            ]
        };

        var expected = new CompanyReviewsPageOperationModel
        {
            TotalCount = 1,
            Reviews =
            [
                new CompanyReviewOperationModel
                {
                    ReviewId = reviewId,
                    AuthorId = authorId,
                    IconId = "ic_user_1",
                    Text = "сильная команда, но процессы местами сыроваты",
                    Score = 12,
                    Weight = 0,
                    CreatedAt = repoOutput.Reviews[0].CreatedAt,
                    Flags =
                    [
                        new FlagOperationModel
                        {
                            Id = flagId,
                            Name = "процессы"
                        }
                    ]
                }
            ]
        };

        _mapper.Map<GetCompanyReviewsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<CompanyReviewsPageOperationModel>(repoOutput).Returns(expected);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.TotalCount);
        Assert.Single(result.Value.Reviews);
        Assert.Equal(reviewId, result.Value.Reviews[0].ReviewId);

        _mapper.Received(1).Map<GetCompanyReviewsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompanyReviewsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<CompanyReviewsPageOperationModel>(repoOutput);
    }
}