export default function(player) {
  describe('External Api', function() {
    it(`External Api should be equaled.`, function() {
      const api = [
        'on',
        'off',
        'setCurrentTime',
        'play',
        'pause',
        'setVolume',
        'setMuted',
        'replay',
        'setSeeking',
        'fullscreen',
        'controlbar',
        'showErrorMessage',
        'setPlaybackRate',
        'playing',
        'ended',
        'loading',
        'bufferTime',
        'seeking',
        'currentTime',
        'duration',
        'isError',
      ];
      api.forEach(v => {
        expect(!!~Object.keys(player).indexOf(v)).to.equal(true);
      });
    });
  });
}
