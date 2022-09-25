import { configureStore } from '@reduxjs/toolkit';
import {graphSlice,selectionSlice} from './reducers';
var store =  configureStore({
    reducer: {
      graphReducer: graphSlice.reducer,
      selectionReducer: selectionSlice.reducer
    },
  })
export default store;
export type RootState = ReturnType<typeof store.getState>;