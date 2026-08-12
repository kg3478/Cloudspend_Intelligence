'use client'

import { useState, useEffect } from 'react'
import { api } from './api'

export function useDatasets() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.listDatasets()
      .then(setDatasets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return {
    datasets,
    loading,
    error,
  }
}

export function useDataset() {
  const [datasetId, setDatasetIdState] =
    useState<string | null>(null)

  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? localStorage.getItem('cs_dataset_id')
        : null

    if (stored) {
      setDatasetIdState(stored)
    }
  }, [])

  const setDatasetId = (id: string) => {
    setDatasetIdState(id)

    if (typeof window !== 'undefined') {
      localStorage.setItem('cs_dataset_id', id)
    }
  }

  return {
    datasetId,
    setDatasetId,
  }
}