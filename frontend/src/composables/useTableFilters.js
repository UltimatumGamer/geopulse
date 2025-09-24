import { ref, computed, onBeforeUnmount } from 'vue'
import { useTimezone } from './useTimezone'
import { findOriginStay, findDestinationStay } from '@/utils/tripHelpers'

const timezone = useTimezone()

/**
 * Composable for shared table filtering functionality
 * Used across StaysTable, TripsTable, and DataGapsTable components
 * @param {Object} options - Configuration options for the filters
 * @param {Array} options.durationOptions - Custom duration filter options
 * @param {Array} options.transportModeOptions - Custom transport mode filter options  
 * @param {Array} options.distanceOptions - Custom distance filter options
 */
export function useTableFilters(options = {}) {
  // Common filter states
  const searchTerm = ref('')
  const durationFilter = ref(null)
  const selectedTransportMode = ref(null)
  const distanceFilter = ref(null)

  // Default filter options (can be overridden by parameters)
  const defaultDurationOptions = [
    { label: 'Less than 1 hour', value: 'short', maxDuration: 3600 },
    { label: '1-6 hours', value: 'medium', minDuration: 3600, maxDuration: 21600 },
    { label: '6+ hours', value: 'long', minDuration: 21600 }
  ]

  const defaultTransportModeOptions = [
    { label: 'Walk', value: 'WALK' },
    { label: 'Car', value: 'CAR' },
    { label: 'Unknown', value: 'UNKNOWN' }
  ]

  const defaultDistanceOptions = [
    { label: 'Less than 1 km', value: 'short', maxDistance: 1000 },
    { label: '1-10 km', value: 'medium', minDistance: 1000, maxDistance: 10000 },
    { label: '10+ km', value: 'long', minDistance: 10000 }
  ]

  // Component-specific filter options
  const durationFilterOptions = ref(options.durationOptions || [...defaultDurationOptions])
  const transportModeOptions = ref(options.transportModeOptions || [...defaultTransportModeOptions])
  const distanceFilterOptions = ref(options.distanceOptions || [...defaultDistanceOptions])

  // Helper functions for filtering
  const applySearchFilter = (items, searchFields) => {
    if (!searchTerm.value || !searchTerm.value.trim()) return items

    const search = searchTerm.value.toLowerCase().trim()
    return items.filter(item => {
      return searchFields.some(field => {
        const value = getNestedProperty(item, field)
        return value && value.toString().toLowerCase().includes(search)
      })
    })
  }

  const applyDurationFilter = (items, durationField) => {
    if (!durationFilter.value) return items

    const filter = durationFilterOptions.value.find(opt => opt.value === durationFilter.value)
    if (!filter) return items

    return items.filter(item => {
      const duration = item[durationField]
      if (!duration) return false

      if (filter.minDuration && duration < filter.minDuration) return false
      if (filter.maxDuration && duration > filter.maxDuration) return false
      return true
    })
  }

  const applyTransportModeFilter = (items) => {
    if (!selectedTransportMode.value) return items

    return items.filter(item => {
      return item.movementType === selectedTransportMode.value
    })
  }

  const applyDistanceFilter = (items) => {
    if (!distanceFilter.value) return items

    const filter = distanceFilterOptions.value.find(opt => opt.value === distanceFilter.value)
    if (!filter) return items

    return items.filter(item => {
      const distance = item.distanceMeters || item.distance || 0
      if (!distance) return false

      if (filter.minDistance && distance < filter.minDistance) return false
      if (filter.maxDistance && distance > filter.maxDistance) return false
      return true
    })
  }

  // Helper to get nested property values (e.g., 'origin.locationName')
  const getNestedProperty = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  // Enhanced data processors for each table type
  const processStaysData = (stays) => {
    return stays.map(stay => {
      if (stay.timestamp && stay.stayDuration) {
        const startTime = timezone.fromUtc(stay.timestamp)
        const endTime = startTime.clone().add(stay.stayDuration, 'seconds')
        return {
          ...stay,
          endTime: endTime.toISOString()
        }
      }
      return stay
    })
  }

  const processTripsData = (trips, stays) => {
    return trips.map(trip => {
      const startTime = timezone.fromUtc(trip.timestamp)
      const endTime = startTime.clone().add(trip.tripDuration || 0, 'seconds')
      
      // Find origin stay (latest stay before trip start)
      const origin = findOriginStay(stays, trip.timestamp)
      
      // Find destination stay (earliest stay after trip end)
      const destination = findDestinationStay(stays, endTime.toISOString())
      
      return {
        ...trip,
        endTime: endTime.toISOString(),
        origin,
        destination
      }
    })
  }

  const processDataGapsData = (dataGaps) => {
    return dataGaps.map(gap => {
      // Data gaps have startTime and endTime properties
      if (gap.startTime && gap.endTime) {
        const start = timezone.fromUtc(gap.startTime)
        const end = timezone.fromUtc(gap.endTime)
        const duration = end.diff(start, 'seconds')
        return {
          ...gap,
          duration // Add calculated duration in seconds for filtering
        }
      }
      return gap
    })
  }


  // Main filter functions for each table type
  const useStaysFilter = (stays) => {
    return computed(() => {
      let filtered = processStaysData(stays.value || [])
      
      // Apply search filter (location name and address)
      filtered = applySearchFilter(filtered, ['locationName', 'address'])
      
      // Apply duration filter
      filtered = applyDurationFilter(filtered, 'stayDuration')
      
      return filtered
    })
  }

  const useTripsFilter = (trips, stays) => {
    return computed(() => {
      let filtered = processTripsData(trips.value || [], stays.value || [])
      
      // Apply search filter (origin/destination names, movement type)
      filtered = applySearchFilter(filtered, [
        'origin.locationName', 
        'destination.locationName', 
        'movementType'
      ])
      
      // Apply transport mode filter
      filtered = applyTransportModeFilter(filtered)
      
      // Apply distance filter
      filtered = applyDistanceFilter(filtered)
      
      return filtered
    })
  }

  const useDataGapsFilter = (dataGaps) => {
    return computed(() => {
      let filtered = processDataGapsData(dataGaps.value || [])
      
      // Apply duration filter
      filtered = applyDurationFilter(filtered, 'duration')
      
      return filtered
    })
  }

  // Reset functions
  const resetFilters = () => {
    searchTerm.value = ''
    durationFilter.value = null
    selectedTransportMode.value = null
    distanceFilter.value = null
  }

  const resetSearchFilter = () => {
    searchTerm.value = ''
  }

  const resetDurationFilter = () => {
    durationFilter.value = null
  }

  // Cleanup function to dispose of computed refs and clear reactive state
  const cleanup = () => {
    searchTerm.value = ''
    durationFilter.value = null
    selectedTransportMode.value = null
    distanceFilter.value = null
    durationFilterOptions.value = []
    transportModeOptions.value = []
    distanceFilterOptions.value = []
  }

  // Register cleanup on component unmount
  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    // Filter states
    searchTerm,
    durationFilter,
    selectedTransportMode,
    distanceFilter,
    
    // Filter options
    durationFilterOptions,
    transportModeOptions,
    distanceFilterOptions,
    
    // Main filter functions
    useStaysFilter,
    useTripsFilter,
    useDataGapsFilter,
    
    // Reset functions
    resetFilters,
    resetSearchFilter,
    resetDurationFilter,
    
    // Cleanup function (for manual cleanup if needed)
    cleanup,
    
    // Utility functions (exported for advanced use cases)
    applySearchFilter,
    applyDurationFilter,
    applyTransportModeFilter,
    applyDistanceFilter,
    processStaysData,
    processTripsData,
    processDataGapsData
  }
}