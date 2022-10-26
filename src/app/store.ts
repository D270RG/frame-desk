import { configureStore } from '@reduxjs/toolkit';
import {graphSlice,frameEditSlice,overlayEffectsSlice} from './reducers';
var store =  configureStore({
    reducer: {
      graphReducer: graphSlice.reducer,
      frameEditReducer: frameEditSlice.reducer,
      overlayEffectsReducer: overlayEffectsSlice.reducer
    },
  })
export default store;
export type RootState = ReturnType<typeof store.getState>;