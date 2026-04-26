using ReviewService.Core.Abstractions.Models.Shared;
using ReviewService.Core.Operations.Flags;
using ReviewService.PersistentStorage.Abstractions.Models.Flags;
using ReviewService.PersistentStorage.Abstractions.Repositories.Flags;
using NSubstitute;

namespace ReviewService.Tests.UnitTests.Operations.Flags.Query;

public sealed class GetUserFlagsOperationTests
{
    private readonly IFlagsQueryRepository _flagsQueryRepository = Substitute.For<IFlagsQueryRepository>();

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsFlags_ShouldReturnSuccess()
    {
        var operation = new GetUserFlagsOperation(_flagsQueryRepository);
        var userId = Guid.NewGuid();

        _flagsQueryRepository.GetUserFlagsAsync(userId, Arg.Any<CancellationToken>())
            .Returns(new GetUserFlagsRepositoryModel
            {
                GreenFlags =
                [
                    new GetUserFlagGroupRepositoryModel
                    {
                        Weight = 3,
                        Flags = [Guid.NewGuid()]
                    }
                ],
                RedFlags = []
            });

        var result = await operation.GetAsync(userId, CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Single(result.Value.GreenFlags);
        Assert.Empty(result.Value.RedFlags);
    }

    [Fact]
    public async Task GetAsync_WhenRepositoryReturnsNull_ShouldReturnNotFound()
    {
        var operation = new GetUserFlagsOperation(_flagsQueryRepository);
        var userId = Guid.NewGuid();

        _flagsQueryRepository.GetUserFlagsAsync(userId, Arg.Any<CancellationToken>())
            .Returns((GetUserFlagsRepositoryModel?)null);

        var result = await operation.GetAsync(userId, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("user not found", result.Error.Message);
        Assert.Equal(ErrorType.NotFound, result.Error.Type);
    }

    [Fact]
    public async Task GetAsync_WhenUserIdIsEmpty_ShouldReturnValidationError()
    {
        var operation = new GetUserFlagsOperation(_flagsQueryRepository);

        var result = await operation.GetAsync(Guid.Empty, CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("userId is required", result.Error.Message);
    }
}
