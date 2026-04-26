using AutoMapper;
using NSubstitute;
using ReviewService.CloudStorage.Abstractions.Services;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Tests.UnitTests.Operations.Companies.Query;

public sealed class GetCompanyOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();
    private readonly ICompanyIconsStorage _iconsStorage = Substitute.For<ICompanyIconsStorage>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldEnrichIconUrl_AndReturnSuccess()
    {
        // Arrange
        var operation = new GetCompanyOperation(_mapper, _queryRepository, _iconsStorage);

        var companyId = Guid.NewGuid();
        var iconId = Guid.NewGuid();

        var repoInput = new GetCompanyRepositoryInputModel
        {
            CompanyId = companyId
        };

        var repoOutput = new GetCompanyRepositoryOutputModel
        {
            CompanyId = companyId,
            Name = "Яндекс",
            IconId = iconId,
            Description = "крупная технологическая компания",
            Links = new CompanyLinksRepositoryModel
            {
                Site = "https://ya.ru",
                Linkedin = "https://linkedin.com/company/yandex",
                Hh = "https://hr.yandex.ru"
            },
            TopFlags =
            [
                new FlagCountRepositoryModel
                {
                    Id = Guid.NewGuid(),
                    Name = "профи в своём деле",
                    Count = 81
                }
            ]
        };

        // mapper отдаёт модель БЕЗ url (операция должна обогатить через s3)
        var mapped = new GetCompanyOperationResultModel
        {
            CompanyId = companyId,
            Name = "Яндекс",
            IconUrl = string.Empty,
            Description = "крупная технологическая компания",
            Links = new CompanyLinksOperationModel
            {
                Site = "https://ya.ru",
                Linkedin = "https://linkedin.com/company/yandex",
                Hh = "https://hr.yandex.ru"
            },
            TopFlags =
            [
                new CompanyFlagOperationModel
                {
                    Id = repoOutput.TopFlags[0].Id,
                    Name = "профи в своём деле",
                    Count = 81
                }
            ]
        };

        var expectedUrl = "http://minio.local/review-service/company-icons/yandex.png?sig=123";

        _mapper.Map<GetCompanyRepositoryInputModel>(companyId).Returns(repoInput);
        _queryRepository.GetCompanyAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<GetCompanyOperationResultModel>(repoOutput).Returns(mapped);

        _iconsStorage.GetIconReadUrlAsync(iconId, Arg.Any<CancellationToken>()).Returns(expectedUrl);

        // Act
        var result = await operation.GetAsync(companyId, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(companyId, result.Value.CompanyId);
        Assert.Equal("Яндекс", result.Value.Name);
        Assert.Equal(expectedUrl, result.Value.IconUrl);

        _mapper.Received(1).Map<GetCompanyRepositoryInputModel>(companyId);
        await _queryRepository.Received(1).GetCompanyAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<GetCompanyOperationResultModel>(repoOutput);
        await _iconsStorage.Received(1).GetIconReadUrlAsync(iconId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound_AndNotCallIconsStorage()
    {
        // Arrange
        var operation = new GetCompanyOperation(_mapper, _queryRepository, _iconsStorage);

        var companyId = Guid.NewGuid();

        var repoInput = new GetCompanyRepositoryInputModel
        {
            CompanyId = companyId
        };

        _mapper.Map<GetCompanyRepositoryInputModel>(companyId).Returns(repoInput);
        _queryRepository.GetCompanyAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetCompanyRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(companyId, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("company not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);

        _mapper.Received(1).Map<GetCompanyRepositoryInputModel>(companyId);
        await _queryRepository.Received(1).GetCompanyAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<GetCompanyOperationResultModel>(Arg.Any<GetCompanyRepositoryOutputModel>());

        await _iconsStorage.DidNotReceive().GetIconReadUrlAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenIconIdIsEmpty_ShouldReturnSuccess_AndNotCallIconsStorage()
    {
        // Arrange
        var operation = new GetCompanyOperation(_mapper, _queryRepository, _iconsStorage);

        var companyId = Guid.NewGuid();

        var repoInput = new GetCompanyRepositoryInputModel
        {
            CompanyId = companyId
        };

        var repoOutput = new GetCompanyRepositoryOutputModel
        {
            CompanyId = companyId,
            Name = "NoIconCo",
            IconId = Guid.Empty,
            Description = "no icon",
            Links = new CompanyLinksRepositoryModel { Site = null, Linkedin = null, Hh = null },
            TopFlags = []
        };

        var mapped = new GetCompanyOperationResultModel
        {
            CompanyId = companyId,
            Name = "NoIconCo",
            IconUrl = string.Empty,
            Description = "no icon",
            Links = new CompanyLinksOperationModel { Site = null, Linkedin = null, Hh = null },
            TopFlags = []
        };

        _mapper.Map<GetCompanyRepositoryInputModel>(companyId).Returns(repoInput);
        _queryRepository.GetCompanyAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _mapper.Map<GetCompanyOperationResultModel>(repoOutput).Returns(mapped);

        // Act
        var result = await operation.GetAsync(companyId, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("NoIconCo", result.Value.Name);

        await _iconsStorage.DidNotReceive().GetIconReadUrlAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }
}