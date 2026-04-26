using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Models.Companies.CreateCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.CreateCompany;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Tests.UnitTests.Operations.Companies.Command;

public sealed class CreateCompanyRequestOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();
    private readonly ICompaniesCommandRepository _commandRepository = Substitute.For<ICompaniesCommandRepository>();

    [Fact]
    public async Task CreateAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyRequestOperation(_mapper, _queryRepository, _commandRepository);

        var model = new CreateCompanyOperationRequestModel
        {
            UserId = Guid.Empty,
            Name = "JetBrains",
            Site = "https://www.jetbrains.com"
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);

        await _queryRepository.DidNotReceive()
            .CompanyExistsByNameAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _commandRepository.DidNotReceive()
            .CreateCompanyRequestAsync(Arg.Any<CreateCompanyRequestRepositoryInputModel>(),
                Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenNameIsEmpty_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyRequestOperation(_mapper, _queryRepository, _commandRepository);

        var model = new CreateCompanyOperationRequestModel
        {
            UserId = Guid.NewGuid(),
            Name = "   ",
            Site = "https://www.jetbrains.com"
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("name is required", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task CreateAsync_WhenNameTooLong_ShouldReturnValidationError()
    {
        // Arrange
        var operation = new CreateCompanyRequestOperation(_mapper, _queryRepository, _commandRepository);

        var model = new CreateCompanyOperationRequestModel
        {
            UserId = Guid.NewGuid(),
            Name = new string('a', 201),
            Site = "https://www.jetbrains.com"
        };

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("name is too long", result.Error.Message);
        Assert.Equal(ErrorType.Validation, result.Error.Type);
    }

    [Fact]
    public async Task CreateAsync_WhenCompanyAlreadyExists_ShouldReturnConflict()
    {
        // Arrange
        var operation = new CreateCompanyRequestOperation(_mapper, _queryRepository, _commandRepository);

        var model = new CreateCompanyOperationRequestModel
        {
            UserId = Guid.NewGuid(),
            Name = "JetBrains",
            Site = "https://www.jetbrains.com"
        };

        _queryRepository.CompanyExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("company already exists", result.Error.Message);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);

        await _queryRepository.Received(1).CompanyExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>());
        await _queryRepository.DidNotReceive()
            .PendingCompanyRequestExistsByNameAsync(Arg.Any<string>(), Arg.Any<CancellationToken>());
        await _commandRepository.DidNotReceive()
            .CreateCompanyRequestAsync(Arg.Any<CreateCompanyRequestRepositoryInputModel>(),
                Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenPendingRequestAlreadyExists_ShouldReturnConflict()
    {
        // Arrange
        var operation = new CreateCompanyRequestOperation(_mapper, _queryRepository, _commandRepository);

        var model = new CreateCompanyOperationRequestModel
        {
            UserId = Guid.NewGuid(),
            Name = "JetBrains",
            Site = "https://www.jetbrains.com"
        };

        _queryRepository.CompanyExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>())
            .Returns(false);

        _queryRepository.PendingCompanyRequestExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>())
            .Returns(true);

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("pending request already exists", result.Error.Message);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);

        await _queryRepository.Received(1).CompanyExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>());
        await _queryRepository.Received(1)
            .PendingCompanyRequestExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>());
        await _commandRepository.DidNotReceive()
            .CreateCompanyRequestAsync(Arg.Any<CreateCompanyRequestRepositoryInputModel>(),
                Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateAsync_WhenInputIsValid_ShouldCreateRequestAndReturnSuccess()
    {
        // Arrange
        var operation = new CreateCompanyRequestOperation(_mapper, _queryRepository, _commandRepository);

        var userId = Guid.NewGuid();
        var requestId = Guid.NewGuid();
        var createdAt = DateTime.UtcNow;

        var model = new CreateCompanyOperationRequestModel
        {
            UserId = userId,
            Name = "  JetBrains  ",
            Site = "https://www.jetbrains.com"
        };

        var repoOutput = new CreateCompanyRequestRepositoryOutputModel
        {
            RequestId = requestId,
            Status = "pending",
            CreatedAtUtc = createdAt
        };

        _queryRepository.CompanyExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>())
            .Returns(false);

        _queryRepository.PendingCompanyRequestExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>())
            .Returns(false);

        _commandRepository.CreateCompanyRequestAsync(
                Arg.Any<CreateCompanyRequestRepositoryInputModel>(),
                Arg.Any<CancellationToken>())
            .Returns(repoOutput);

        // Act
        var result = await operation.CreateAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(requestId.ToString(), result.Value.RequestId);
        Assert.Equal("pending", result.Value.Status);
        Assert.Equal(
            new DateTimeOffset(DateTime.SpecifyKind(createdAt, DateTimeKind.Utc)),
            result.Value.CreatedAt);

        await _queryRepository.Received(1).CompanyExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>());
        await _queryRepository.Received(1)
            .PendingCompanyRequestExistsByNameAsync("JetBrains", Arg.Any<CancellationToken>());

        await _commandRepository.Received(1).CreateCompanyRequestAsync(
            Arg.Is<CreateCompanyRequestRepositoryInputModel>(x =>
                x.RequesterUserId == userId &&
                x.Name == "JetBrains" &&
                x.SiteUrl == "https://www.jetbrains.com"),
            Arg.Any<CancellationToken>());

        _mapper.DidNotReceiveWithAnyArgs().Map<CreateCompanyRequestRepositoryInputModel>(default!);
        _mapper.DidNotReceiveWithAnyArgs().Map<CreateCompanyOperationResultModel>(default!);
    }
}