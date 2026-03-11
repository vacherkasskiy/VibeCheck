using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Tests.UnitTests.Operations.Companies;

public sealed class GetCompaniesOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldReturnSuccess()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository);

        var model = new GetCompaniesOperationModel(
            Query: "ozon",
            Take: 20,
            PageNum: 1,
            Q: null);

        var repoInput = new GetCompaniesRepositoryInputModel
        {
            Query = "ozon",
            Take = 20,
            PageNum = 1,
            Q = null
        };

        var repoOutput = new GetCompaniesRepositoryOutputModel
        {
            TotalCount = 1,
            Companies =
            [
                new CompanyListItemRepositoryModel
                {
                    CompanyId = Guid.NewGuid(),
                    Name = "Ozon",
                    IconId = "ic_ozon",
                    TopFlags =
                    [
                        new FlagCountRepositoryModel
                        {
                            Id = Guid.NewGuid(),
                            Name = "компания растёт",
                            Count = 75
                        }
                    ]
                }
            ]
        };

        var expected = new GetCompaniesOperationResultModel
        {
            TotalCount = 1,
            Companies =
            [
                new CompanyListItemOperationModel
                {
                    CompanyId = repoOutput.Companies[0].CompanyId,
                    Name = "Ozon",
                    IconId = "ic_ozon",
                    Weight = 0.94,
                    TopFlags =
                    [
                        new CompanyFlagOperationModel
                        {
                            Id = repoOutput.Companies[0].TopFlags[0].Id,
                            Name = "компания растёт",
                            Count = 75
                        }
                    ]
                }
            ]
        };

        _mapper.Map<GetCompaniesRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<GetCompaniesOperationResultModel>(repoOutput).Returns(expected);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.False(result.IsFailure);
        Assert.Equal(1, result.Value.TotalCount);
        Assert.Single(result.Value.Companies);
        Assert.Equal("Ozon", result.Value.Companies[0].Name);

        _mapper.Received(1).Map<GetCompaniesRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<GetCompaniesOperationResultModel>(repoOutput);
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnFailure()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository);

        var model = new GetCompaniesOperationModel(
            Query: null,
            Take: 20,
            PageNum: 1,
            Q: null);

        var repoInput = new GetCompaniesRepositoryInputModel
        {
            Query = null,
            Take = 20,
            PageNum = 1,
            Q = null
        };

        _mapper.Map<GetCompaniesRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetCompaniesRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("failed to load companies", result.Error.Message);
        Assert.Equal(ErrorType.Failure, result.Error.Type);

        _mapper.Received(1).Map<GetCompaniesRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<GetCompaniesOperationResultModel>(Arg.Any<GetCompaniesRepositoryOutputModel>());
    }
}