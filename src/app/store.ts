import { configureStore } from '@reduxjs/toolkit';
import {graphSlice,frameEditSlice,overlayEffectsSlice,selectionSlice} from './reducers';
var store =  configureStore({
    reducer: {
      graphReducer: graphSlice.reducer,
      frameEditReducer: frameEditSlice.reducer,
      selectionReducer: selectionSlice.reducer,
      overlayEffectsReducer: overlayEffectsSlice.reducer
    },
  })
export default store;
export type RootState = ReturnType<typeof store.getState>;