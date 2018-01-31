export const namespace = 'ready';
export default function() {
  return {
    namespace,
    state: false,
    reducers: {
      state: function(state, { payload }) {
        return true;
      },
      clear: function(state, { payload }) {
        return this.state;
      },
    },
  };
}
