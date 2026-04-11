using NSubstitute;
using ReviewService.Core.Abstractions.Models.Reviews.CreateCompanyReview;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Reviews;
using ReviewService.MessageBroker.Abstractions.Producers;
using ReviewService.PersistentStorage.Abstractions.Models.Reviews;
using ReviewService.PersistentStorage.Abstractions.Repositories.Reviews;

namespace ReviewService.Tests.UnitTests.Operations.Reviews.Command;

public sealed class CreateCompanyReviewOperationTests
{
    private readonly IReviewsQueryRepository _queryRepository = Substitute.For<IReviewsQueryRepository>();
    private readonly IReviewsCommandRepository _commandRepository = Substitute.For<IReviewsCommandRepository>();
    private readonly IReviewEventsProducer _reviewEventsProducer = Substitute.For<IReviewEventsProducer>();

    [Fact]
    public async Task CreateAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.Empty,
            CompanyId = Guid.NewGuid(),
            Text = "text",
            Flags = [Guid.NewGuid()]
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        await _queryRepository.DidNotReceive().CompanyExistsAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
        await _commandRepository.DidNotReceive().CreateReviewAsync(Arg.Any<CreateReviewCommandRepositoryModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenCompanyIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.Empty,
            Text = "text",
            Flags = [Guid.NewGuid()]
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("companyId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task CreateAsync_WhenFlagsAreEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            Text = "text",
            Flags = []
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("flags are required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task CreateAsync_WhenFlagsCountGreaterThanTen_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            Text = "text",
            Flags = Enumerable.Range(0, 11).Select(_ => Guid.NewGuid()).ToArray()
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("too many flags", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task CreateAsync_WhenTextTooLong_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            Text = new string('a', 1001),
            Flags = [Guid.NewGuid()]
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("text is too long", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task CreateAsync_WhenCompanyDoesNotExist_ShouldReturnNotFound()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            Text = "text",
            Flags = [Guid.NewGuid()]
        };

        _queryRepository.CompanyExistsAsync(model.CompanyId, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("company not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);

        await _commandRepository.DidNotReceive().CreateReviewAsync(Arg.Any<CreateReviewCommandRepositoryModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenSomeFlagsDoNotExist_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            Text = "text",
            Flags = [Guid.NewGuid(), Guid.NewGuid()]
        };

        _queryRepository.CompanyExistsAsync(model.CompanyId, Arg.Any<CancellationToken>())
            .Returns(true);

        _queryRepository.AllFlagsExistAsync(model.Flags, Arg.Any<CancellationToken>())
            .Returns(false);

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("one or more flags not found", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        await _commandRepository.DidNotReceive().CreateReviewAsync(Arg.Any<CreateReviewCommandRepositoryModel>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenInputIsValid_ShouldCallRepositoryAndReturnSuccess()
    {
        // Arrange
        var operation = new CreateCompanyReviewOperation(_queryRepository, _commandRepository, _reviewEventsProducer);

        var flag1 = Guid.NewGuid();
        var flag2 = Guid.NewGuid();

        var model = new CreateCompanyReviewOperationModel
        {
            UserId = Guid.NewGuid(),
            CompanyId = Guid.NewGuid(),
            Text = "valid text",
            Flags = [flag1, flag2, flag1]
        };

        _queryRepository.CompanyExistsAsync(model.CompanyId, Arg.Any<CancellationToken>())
            .Returns(true);

        _queryRepository.AllFlagsExistAsync(model.Flags, Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);

        await _commandRepository.Received(1).CreateReviewAsync(
            Arg.Is<CreateReviewCommandRepositoryModel>(x =>
                x.CompanyId == model.CompanyId &&
                x.AuthorId == model.UserId &&
                x.Text == model.Text &&
                x.FlagIds.Count == 2 &&
                x.FlagIds.Contains(flag1) &&
                x.FlagIds.Contains(flag2)),
            Arg.Any<CancellationToken>());
    }
}