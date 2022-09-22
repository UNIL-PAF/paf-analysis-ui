import { createSlice } from '@reduxjs/toolkit'
import {getProteinTable} from './BackendProteinTable'

const parseError = function(action){
    if (action.payload) {
        return action.payload.message
    } else {
        return action.error.message
    }
}

export const proteinTableSlice = createSlice({
    name: 'protein_table',
    initialState: {
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProteinTable.pending, (state, action) => {
                state.status = 'loading'
            })
            .addCase(getProteinTable.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.data = action.payload
            })
            .addCase(getProteinTable.rejected, (state, action) => {
                state.status = 'failed'
                state.error = parseError(action)
            })
    },
})

export default proteinTableSlice.reducer