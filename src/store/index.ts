import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const makeStore = () => {
  try {
    console.log('🔧 Creating Redux store...');
    
    const store = configureStore({
      reducer: {
        auth: authReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
            ignoredPaths: ['items.dates'],
          },
          immutableCheck: {
            warnAfter: 128,
          },
        }),
      devTools: process.env.NODE_ENV !== 'production',
    });
    
    console.log('✅ Redux store created successfully');
    return store;
  } catch (error) {
    console.error('💥 Error creating Redux store:', error);
    throw error;
  }
};

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = ReturnType<typeof makeStore>;
