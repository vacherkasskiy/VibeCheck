using AutoMapper;
using NSubstitute;
using ReviewService.CloudStorage.Abstractions.Services;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanies;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanies;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Tests.UnitTests.Operations.Companies.Query;

public sealed class GetCompaniesOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();
    private readonly ICompanyIconsStorage _iconsStorage = Substitute.For<ICompanyIconsStorage>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldEnrichIconUrls_AndReturnSuccess()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _iconsStorage);

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

        var iconId = Guid.NewGuid();

        var repoOutput = new GetCompaniesRepositoryOutputModel
        {
            TotalCount = 1,
            Companies =
            [
                new CompanyListItemRepositoryModel
                {
                    CompanyId = Guid.NewGuid(),
                    Name = "Ozon",
                    IconId = iconId,
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

        // mapper отдаёт результат БЕЗ iconUrl, а операция должна обогатить
        var mapped = new GetCompaniesOperationResultModel
        {
            TotalCount = 1,
            Companies =
            [
                new CompanyListItemOperationModel
                {
                    CompanyId = repoOutput.Companies[0].CompanyId,
                    Name = "Ozon",
                    IconUrl = string.Empty, // будет заполнено
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

        var expectedUrl = "http://minio.local/review-service/company-icons/ozon.png?X-Amz-Signature=123";

        _mapper.Map<GetCompaniesRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<GetCompaniesOperationResultModel>(repoOutput).Returns(mapped);

        _iconsStorage.GetIconReadUrlAsync(iconId, Arg.Any<CancellationToken>())
            .Returns(expectedUrl);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(1, result.Value.TotalCount);
        Assert.Single(result.Value.Companies);
        Assert.Equal("Ozon", result.Value.Companies[0].Name);
        Assert.Equal(expectedUrl, result.Value.Companies[0].IconUrl);

        _mapper.Received(1).Map<GetCompaniesRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<GetCompaniesOperationResultModel>(repoOutput);

        await _iconsStorage.Received(1).GetIconReadUrlAsync(iconId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnFailure_AndNotCallIconsStorage()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _iconsStorage);

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

        await _iconsStorage.DidNotReceive().GetIconReadUrlAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenIconIdIsEmpty_ShouldNotCallIconsStorage_AndReturnSuccess()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _iconsStorage);

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

        var repoOutput = new GetCompaniesRepositoryOutputModel
        {
            TotalCount = 1,
            Companies =
            [
                new CompanyListItemRepositoryModel
                {
                    CompanyId = Guid.NewGuid(),
                    Name = "NoIconCo",
                    IconId = Guid.Empty,
                    TopFlags = []
                }
            ]
        };

        var mapped = new GetCompaniesOperationResultModel
        {
            TotalCount = 1,
            Companies =
            [
                new CompanyListItemOperationModel
                {
                    CompanyId = repoOutput.Companies[0].CompanyId,
                    Name = "NoIconCo",
                    IconUrl = string.Empty,
                    Weight = 0,
                    TopFlags = []
                }
            ]
        };

        _mapper.Map<GetCompaniesRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompaniesAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<GetCompaniesOperationResultModel>(repoOutput).Returns(mapped);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.Companies);
        Assert.Equal("NoIconCo", result.Value.Companies[0].Name);

        await _iconsStorage.DidNotReceive().GetIconReadUrlAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}