import { configureStore } from '@reduxjs/toolkit';
import {zoomSlice,graphSlice,frameEditSlice,overlayEffectsSlice, listenersStateSlice} from './reducers';
var store =  configureStore({
    reducer: {
      listenersStateReducer: listenersStateSlice.reducer,
      zoomReducer: zoomSlice.reducer,
      graphReducer: graphSlice.reducer,
      frameEditReducer: frameEditSlice.reducer,
      overlayEffectsReducer: overlayEffectsSlice.reducer
    },
  })
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;