using ReviewService.Core.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;
using NSubstitute;

namespace ReviewService.Tests.UnitTests.Operations.Flags.Query;

public sealed class GetMyUserFlagsOperationTests
{
    private readonly IFlagsQueryRepository _flagsQueryRepository = Substitute.For<IFlagsQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsFlags_ShouldReturnSuccess()
    {
        var operation = new GetMyUserFlagsOperation(_flagsQueryRepository);
        var userId = Guid.NewGuid();

        _flagsQueryRepository.GetUserFlagsAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new GetUserFlagsRepositoryModel
            {
                GreenFlags =
                [
                    new GetUserFlagGroupRepositoryModel
                    {
                        Weight = 1,
                        Flags = [Guid.NewGuid(), Guid.NewGuid()]
                    }
                ],
                RedFlags =
                [
                    new GetUserFlagGroupRepositoryModel
                    {
                        Weight = 2,
                        Flags = [Guid.NewGuid()]
                    }
                ]
            });

        var result = await operation.GetAsync(userId, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.GreenFlags);
        Assert.Single(result.Value.RedFlags);
        Assert.Equal(1, result.Value.GreenFlags.Single().Weight);
        Assert.Equal(2, result.Value.RedFlags.Single().Weight);
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnEmptyFlags()
    {
        var operation = new GetMyUserFlagsOperation(_flagsQueryRepository);
        var userId = Guid.NewGuid();

        _flagsQueryRepository.GetUserFlagsAsync(userId, Arg.Any<CancellationToken>())
            .Returns((GetUserFlagsRepositoryModel?)null);

        var result = await operation.GetAsync(userId, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(result.Value.GreenFlags);
        Assert.Empty(result.Value.RedFlags);
    }

    [Fact]
    public async Task GetAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new GetMyUserFlagsOperation(_flagsQueryRepository);

        var result = await operation.GetAsync(Guid.Empty, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("currentUserId is required", result.Error.Message);
    }
}
