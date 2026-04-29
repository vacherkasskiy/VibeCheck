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
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles;
using ReviewService.PersistentStorage.Abstractions.Models.UserProfiles.Enums;
using ReviewService.PersistentStorage.Abstractions.Repositories.UserProfiles;

namespace ReviewService.Tests.UnitTests.Operations.Companies.Query;

public sealed class GetCompaniesOperationTests
{
    private readonly IMapper _mapper = Substitute.For<IMapper>();
    private readonly ICompaniesQueryRepository _queryRepository = Substitute.For<ICompaniesQueryRepository>();
    private readonly IUserProfilesQueryRepository _userProfilesQueryRepository = Substitute.For<IUserProfilesQueryRepository>();
    private readonly ICompanyIconsStorage _iconsStorage = Substitute.For<ICompanyIconsStorage>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsData_ShouldEnrichIconUrls_AndReturnSuccess()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _userProfilesQueryRepository, _iconsStorage);
        var currentUserId = Guid.NewGuid();

        var model = new GetCompaniesOperationModel(
            CurrentUserId: currentUserId,
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
                    Weight = 0,
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
        _queryRepository.GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _userProfilesQueryRepository.GetUserFlagsForWeightAsync(currentUserId, Arg.Any<CancellationToken>())
            .Returns([]);
        _mapper.Map<GetCompaniesOperationResultModel>(Arg.Any<GetCompaniesRepositoryOutputModel>()).Returns(mapped);

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
        await _queryRepository.Received(1).GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.Received(1).Map<GetCompaniesOperationResultModel>(Arg.Any<GetCompaniesRepositoryOutputModel>());

        await _iconsStorage.Received(1).GetIconReadUrlAsync(iconId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnFailure_AndNotCallIconsStorage()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _userProfilesQueryRepository, _iconsStorage);
        var currentUserId = Guid.NewGuid();

        var model = new GetCompaniesOperationModel(
            CurrentUserId: currentUserId,
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
        _queryRepository.GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>())
            .Returns((GetCompaniesRepositoryOutputModel?)null);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsFailure);
        Assert.Equal("failed to load companies", result.Error.Message);
        Assert.Equal(ErrorType.Failure, result.Error.Type);

        _mapper.Received(1).Map<GetCompaniesRepositoryInputModel>(model);
        await _queryRepository.Received(1).GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>());
        _mapper.DidNotReceive().Map<GetCompaniesOperationResultModel>(Arg.Any<GetCompaniesRepositoryOutputModel>());

        await _userProfilesQueryRepository.DidNotReceive().GetUserFlagsForWeightAsync(
            Arg.Any<Guid>(),
            Arg.Any<CancellationToken>());
        await _iconsStorage.DidNotReceive().GetIconReadUrlAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_WhenIconIdIsEmpty_ShouldNotCallIconsStorage_AndReturnSuccess()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _userProfilesQueryRepository, _iconsStorage);
        var currentUserId = Guid.NewGuid();

        var model = new GetCompaniesOperationModel(
            CurrentUserId: currentUserId,
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
                    Weight = 0,
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
        _queryRepository.GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _userProfilesQueryRepository.GetUserFlagsForWeightAsync(currentUserId, Arg.Any<CancellationToken>())
            .Returns([]);
        _mapper.Map<GetCompaniesOperationResultModel>(Arg.Any<GetCompaniesRepositoryOutputModel>()).Returns(mapped);

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.Companies);
        Assert.Equal("NoIconCo", result.Value.Companies[0].Name);

        await _iconsStorage.DidNotReceive().GetIconReadUrlAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task GetAsync_ShouldSortCompaniesByUserFlagWeightDescending()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _userProfilesQueryRepository, _iconsStorage);

        var currentUserId = Guid.NewGuid();
        var positiveFlagId = Guid.NewGuid();
        var negativeFlagId = Guid.NewGuid();
        var neutralFlagId = Guid.NewGuid();

        var model = new GetCompaniesOperationModel(
            CurrentUserId: currentUserId,
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

        var preferredCompany = CreateCompany("Preferred", [CreateFlag(positiveFlagId, "growth", 10)]);
        var neutralCompany = CreateCompany("Neutral", [CreateFlag(neutralFlagId, "remote", 100)]);
        var rejectedCompany = CreateCompany("Rejected", [CreateFlag(negativeFlagId, "overtime", 10)]);

        var repoOutput = new GetCompaniesRepositoryOutputModel
        {
            TotalCount = 3,
            Companies = [rejectedCompany, neutralCompany, preferredCompany]
        };

        _mapper.Map<GetCompaniesRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _userProfilesQueryRepository.GetUserFlagsForWeightAsync(currentUserId, Arg.Any<CancellationToken>())
            .Returns(
            [
                CreateUserFlag(positiveFlagId, UserProfileFlagColorRepositoryEnum.Green, 3),
                CreateUserFlag(negativeFlagId, UserProfileFlagColorRepositoryEnum.Red, 2)
            ]);
        SetupCompaniesMapper();

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(["Preferred", "Neutral", "Rejected"], result.Value.Companies.Select(x => x.Name));
        Assert.Equal(30, result.Value.Companies[0].Weight);
        Assert.Equal(0, result.Value.Companies[1].Weight);
        Assert.Equal(-20, result.Value.Companies[2].Weight);
    }

    [Fact]
    public async Task GetAsync_ShouldApplyPaginationAfterWeightSort()
    {
        // Arrange
        var operation = new GetCompaniesOperation(_mapper, _queryRepository, _userProfilesQueryRepository, _iconsStorage);

        var currentUserId = Guid.NewGuid();
        var flagId = Guid.NewGuid();

        var model = new GetCompaniesOperationModel(
            CurrentUserId: currentUserId,
            Query: null,
            Take: 2,
            PageNum: 2,
            Q: null);

        var repoInput = new GetCompaniesRepositoryInputModel
        {
            Query = null,
            Take = 2,
            PageNum = 2,
            Q = null
        };

        var repoOutput = new GetCompaniesRepositoryOutputModel
        {
            TotalCount = 5,
            Companies =
            [
                CreateCompany("Weight 1", [CreateFlag(flagId, "flag", 1)]),
                CreateCompany("Weight 5", [CreateFlag(flagId, "flag", 5)]),
                CreateCompany("Weight 3", [CreateFlag(flagId, "flag", 3)]),
                CreateCompany("Weight 4", [CreateFlag(flagId, "flag", 4)]),
                CreateCompany("Weight 2", [CreateFlag(flagId, "flag", 2)])
            ]
        };

        _mapper.Map<GetCompaniesRepositoryInputModel>(model).Returns(repoInput);
        _queryRepository.GetCompaniesForWeightAsync(repoInput, Arg.Any<CancellationToken>()).Returns(repoOutput);
        _userProfilesQueryRepository.GetUserFlagsForWeightAsync(currentUserId, Arg.Any<CancellationToken>())
            .Returns([CreateUserFlag(flagId, UserProfileFlagColorRepositoryEnum.Green, 1)]);
        SetupCompaniesMapper();

        // Act
        var result = await operation.GetAsync(model, CancellationToken.None);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(5, result.Value.TotalCount);
        Assert.Equal(["Weight 3", "Weight 2"], result.Value.Companies.Select(x => x.Name));
    }

    private void SetupCompaniesMapper()
    {
        _mapper.Map<GetCompaniesOperationResultModel>(Arg.Any<GetCompaniesRepositoryOutputModel>())
            .Returns(call =>
            {
                var output = call.Arg<GetCompaniesRepositoryOutputModel>();

                return new GetCompaniesOperationResultModel
                {
                    TotalCount = output.TotalCount,
                    Companies = output.Companies
                        .Select(company => new CompanyListItemOperationModel
                        {
                            CompanyId = company.CompanyId,
                            Name = company.Name,
                            IconUrl = string.Empty,
                            Weight = company.Weight,
                            TopFlags = company.TopFlags
                                .Select(flag => new CompanyFlagOperationModel
                                {
                                    Id = flag.Id,
                                    Name = flag.Name,
                                    Count = flag.Count
                                })
                                .ToList()
                        })
                        .ToList()
                };
            });
    }

    private static CompanyListItemRepositoryModel CreateCompany(
        string name,
        IReadOnlyList<FlagCountRepositoryModel> topFlags)
    {
        return new CompanyListItemRepositoryModel
        {
            CompanyId = Guid.NewGuid(),
            Name = name,
            IconId = Guid.Empty,
            Weight = 0,
            TopFlags = topFlags
        };
    }

    private static FlagCountRepositoryModel CreateFlag(Guid flagId, string name, long count)
    {
        return new FlagCountRepositoryModel
        {
            Id = flagId,
            Name = name,
            Count = count
        };
    }

    private static UserProfileFlagForSimilarityRepositoryModel CreateUserFlag(
        Guid flagId,
        UserProfileFlagColorRepositoryEnum color,
        int weight)
    {
        return new UserProfileFlagForSimilarityRepositoryModel
        {
            FlagId = flagId,
            Color = color,
            Weight = weight
        };
    }
}
