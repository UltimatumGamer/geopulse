import {defineStore} from 'pinia'
import apiService from '../utils/apiService'

export const useFavoritesStore = defineStore('favorites', {
    state: () => ({
        favoritePlaces: {
            areas: [],
            points: []
        }
    }),

    getters: {
        // Direct access getter
        getFavoritePlaces: (state) => state.favoritePlaces,

        // Get individual arrays
        getFavoritePoints: (state) => state.favoritePlaces.points || [],
        getFavoriteAreas: (state) => state.favoritePlaces.areas || [],

        // Computed getters for additional functionality
        hasFavorites: (state) => {
            const points = state.favoritePlaces.points || []
            const areas = state.favoritePlaces.areas || []
            return points.length > 0 || areas.length > 0
        },

        hasPoints: (state) => (state.favoritePlaces.points || []).length > 0,
        hasAreas: (state) => (state.favoritePlaces.areas || []).length > 0,

        pointsCount: (state) => (state.favoritePlaces.points || []).length,
        areasCount: (state) => (state.favoritePlaces.areas || []).length,
        totalFavoritesCount: (state) => {
            const points = state.favoritePlaces.points || []
            const areas = state.favoritePlaces.areas || []
            return points.length + areas.length
        },

        // Get favorite by ID (searches both points and areas)
        getFavoriteById: (state) => (id) => {
            const points = state.favoritePlaces.points || []
            const areas = state.favoritePlaces.areas || []
            return points.find(point => point.id === id) ||
                areas.find(area => area.id === id)
        },

        // Get point by ID
        getPointById: (state) => (id) => {
            const points = state.favoritePlaces.points || []
            return points.find(point => point.id === id)
        },

        // Get area by ID
        getAreaById: (state) => (id) => {
            const areas = state.favoritePlaces.areas || []
            return areas.find(area => area.id === id)
        },

        // Search favorites by name (searches both points and areas)
        searchFavorites: (state) => (searchTerm) => {
            if (!searchTerm) return state.favoritePlaces
            const term = searchTerm.toLowerCase()
            const points = state.favoritePlaces.points || []
            const areas = state.favoritePlaces.areas || []

            return {
                points: points.filter(point => point.name.toLowerCase().includes(term)),
                areas: areas.filter(area => area.name.toLowerCase().includes(term))
            }
        },

        // Get points within a bounding box
        getPointsInBounds: (state) => (northEast, southWest) => {
            const points = state.favoritePlaces.points || []
            return points.filter(point =>
                point.lat >= southWest.lat &&
                point.lat <= northEast.lat &&
                point.lon >= southWest.lon &&
                point.lon <= northEast.lon
            )
        }
    },

    actions: {
        // Set favorites data (replaces mutations)
        setFavoritePlaces(places) {
            // Ensure the structure is correct
            this.favoritePlaces = {
                areas: places.areas || [],
                points: places.points || []
            }
        },

        // API Actions
        async fetchFavoritePlaces() {
            try {
                const response = await apiService.get(`/favorites`)
                this.setFavoritePlaces(response.data)
                return response.data
            } catch (error) {
                throw error
            }
        },

        async addPointToFavorites(name, lat, lon) {
            try {
                await apiService.post(`/favorites/point`, {
                    name,
                    lat,
                    lon
                })

                // Refresh favorites to get the updated list from backend
                await this.fetchFavoritePlaces()
            } catch (error) {
                throw error
            }
        },

        async addAreaToFavorites(name, northEastLat, northEastLon, southWestLat, southWestLon) {
            try {
                await apiService.post(`/favorites/area`, {
                    name,
                    northEastLat,
                    northEastLon,
                    southWestLat,
                    southWestLon
                })

                // Refresh favorites to get the updated list from backend
                await this.fetchFavoritePlaces()
            } catch (error) {
                throw error
            }
        },

        async editFavorite(id, name) {
            try {
                await apiService.put(`/favorites/${id}`, {
                    name
                })

                // Refresh favorites to get the updated list from backend
                await this.fetchFavoritePlaces()
            } catch (error) {
                throw error
            }
        },

        async deleteFavorite(id) {
            try {
                await apiService.delete(`/favorites/${id}`, {})

                // Refresh favorites to get the updated list from backend
                await this.fetchFavoritePlaces()
            } catch (error) {
                throw error
            }
        },
    }
})