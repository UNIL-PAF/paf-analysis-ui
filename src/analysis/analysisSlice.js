import {createSlice} from '@reduxjs/toolkit'
import {fetchAnalysisByResultId} from './BackendAnalysis'

export const analysisSlice = createSlice({
    name: 'analysis',
    initialState: {
        resultId: null,
        data: null,
        status: 'idle',
        error: null,
        globalStatus: null
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalysisByResultId.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(fetchAnalysisByResultId.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.data = action.payload.first
                state.globalStatus = action.payload.second
            })
            .addCase(fetchAnalysisByResultId.rejected, (state, action) => {
                state.status = 'failed'
                if (action.payload) {
                    state.error = action.payload.message
                } else {
                    state.error = action.error.message
                }
            })
    },
})

export default analysisSlice.reducer