export interface Course {
  id: string
  name: string
  location: string
  distance: number
  elevationGain: number
  elevationLoss: number
  difficulty: CourseDifficulty
  description?: string
  routeData?: RouteData
  createdAt: Date
  updatedAt: Date
}

export enum CourseDifficulty {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  HARD = 'HARD',
  EXTREME = 'EXTREME'
}

export interface RouteData {
  gpxData?: string
  waypoints: Waypoint[]
  elevationProfile: ElevationPoint[]
}

export interface Waypoint {
  lat: number
  lng: number
  elevation?: number
  name?: string
  type: WaypointType
}

export enum WaypointType {
  START = 'START',
  FINISH = 'FINISH',
  AID_STATION = 'AID_STATION',
  CHECKPOINT = 'CHECKPOINT',
  WATER = 'WATER',
  VIEWPOINT = 'VIEWPOINT'
}

export interface ElevationPoint {
  distance: number // Distance from start in meters
  elevation: number // Elevation in meters
}