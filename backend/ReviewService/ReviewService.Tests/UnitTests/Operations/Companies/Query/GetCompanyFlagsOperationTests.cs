using AutoMapper;
using NSubstitute;
using ReviewService.Core.Abstractions.Models.Companies;
using ReviewService.Core.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Companies;
using ReviewService.PersistentStorage.Abstractions.Models.Companies.GetCompanyFlags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Companies;

namespace ReviewService.Tests.UnitTests.Operations.Companies.Query;

public sealed class GetCompanyFlagsOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldReturnSuccess()
    {
        // Arrange
        var operation = new GetCompanyFlagsOperation(_mapper, _queryRepository);

        var companyId = Guid.NewGuid();

        var model = new GetCompanyFlagsOperationModel(
            CompanyId: companyId,
            Q: "культура",
            Take: 20,
            PageNum: 1);

        var repoInput = new GetCompanyFlagsRepositoryInputModel
        {
            CompanyId = companyId,
            Q = "культура",
            Take = 20,
            PageNum = 1
        };

        var repoOutput = new GetCompanyFlagsRepositoryOutputModel
        {
            CompanyId = companyId,
            TotalCount = 2,
            Flags =
            [
                new CompanyFlagRepositoryModel
                {
                    Id = Guid.NewGuid(),
                    Name = "дружелюбная команда",
                    Count = 18
                },
                new CompanyFlagRepositoryModel
                {
                    Id = Guid.NewGuid(),
                    Name = "можно быть собой",
                    Count = 12
                }
            ]
        };

        var expected = new GetCompanyFlagsOperationResultModel
        {
            CompanyId = companyId,
            TotalCount = 2,
            Flags =
            [
                new CompanyFlagOperationModel
                {
                    Id = repoOutput.Flags[0].Id,
                    Name = "дружелюбная команда",
                    Count = 18
                },
                new CompanyFlagOperationModel
                {
                    Id = repoOutput.Flags[1].Id,
                    Name = "можно быть собой",
                    Count = 12
                }
            ]
        };

        _mapper.Map<GetCompanyFlagsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyFlagsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns(repoOutput);
        _mapper.Map<GetCompanyFlagsOperationResultModel>(repoOutput).Returns(expected);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(companyId, result.Value.CompanyId);
        Assert.Equal(2, result.Value.TotalCount);
        Assert.Equal(2, result.Value.Flags.Count);

        _mapper.Received(1).Map<GetCompanyFlagsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompanyFlagsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<GetCompanyFlagsOperationResultModel>(repoOutput);
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound()
    {
        // Arrange
        var operation = new GetCompanyFlagsOperation(_mapper, _queryRepository);

        var model = new GetCompanyFlagsOperationModel(
            CompanyId: Guid.NewGuid(),
            Q: null,
            Take: 20,
            PageNum: 1);

        var repoInput = new GetCompanyFlagsRepositoryInputModel
        {
            CompanyId = model.CompanyId,
            Q = null,
            Take = 20,
            PageNum = 1
        };

        _mapper.Map<GetCompanyFlagsRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompanyFlagsAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetCompanyFlagsRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("company not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);

        _mapper.Received(1).Map<GetCompanyFlagsRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompanyFlagsAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<GetCompanyFlagsOperationResultModel>(Arg.Any<GetCompanyFlagsRepositoryOutputModel>());
    }
}