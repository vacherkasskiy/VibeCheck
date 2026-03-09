using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompany;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompany;
using ReviewService.PersistentStorage.Abstractions.Models.Shared;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Tests.UnitTests.Operations.Companies;

public sealed class GetCompanyOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldReturnSuccess()
    {
        // Arrange
        var operation = new GetCompanyOperation(_mapper, _queryRepository);

        var companyId = Guid.NewGuid();

        var repoInput = new GetCompanyRepositoryInputModel
        {
            CompanyId = companyId
        };

        var repoOutput = new GetCompanyRepositoryOutputModel
        {
            CompanyId = companyId,
            Name = "Яндекс",
            IconId = "ic_yandex",
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

        var expected = new GetCompanyOperationResultModel
        {
            CompanyId = companyId,
            Name = "Яндекс",
            IconId = "ic_yandex",
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

        _mapper.Map<GetCompanyRepositoryInputModel>(companyId).Returns(repoInput);
        _queryRepository.GetCompanyAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<GetCompanyOperationResultModel>(repoOutput).Returns(expected);

        // Act
        var result = await operation.GetAsync(companyId, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(companyId, result.Value.CompanyId);
        Assert.Equal("Яндекс", result.Value.Name);

        _mapper.Received(1).Map<GetCompanyRepositoryInputModel>(companyId);
        await _queryRepository.Received(1).GetCompanyAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<GetCompanyOperationResultModel>(repoOutput);
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound()
    {
        // Arrange
        var operation = new GetCompanyOperation(_mapper, _queryRepository);

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
    }
}