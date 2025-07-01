# GeoPulse Setup Guide

This guide will help you set up GeoPulse and connect it with GPS tracking apps.

## 🚀 Initial Setup

### 1. First Login
After deploying GeoPulse, visit your frontend URL and create your first account:

1. Click **"Start Your Journey"** or **"Sign In"**
2. Register with email and password
3. Complete your profile setup

### 2. Basic Configuration
Once logged in, you'll see the onboarding tour. Follow these steps:

1. **Set up GPS Sources** - Connect your tracking apps
2. **Configure Timeline** - Adjust sensitivity settings
3. **Add Favorites** - Mark important locations
4. **Invite Friends** - Connect with others (optional)

## 📱 GPS Tracking App Setup

### OwnTracks Configuration

**iOS/Android App Setup:**
1. Download OwnTracks from App Store/Google Play
2. Open OwnTracks settings
3. Configure connection:
   - **Mode:** HTTP
   - **Host:** `your-api-domain.com`
   - **Port:** `443` (for HTTPS)
   - **Path:** `/api/gps-data/owntracks`
   - **Username:** Choose a username
   - **Password:** Choose a password
   - **TLS:** Enable (required for HTTPS)

**GeoPulse Configuration:**
1. Go to **Location Sources** in GeoPulse
2. Click **"Add GPS Source"**
3. Select **OwnTracks**
4. Enter the same username/password from the app
5. Click **"Test Connection"** to verify
6. Save the configuration

### Overland Configuration (iOS)

**iOS App Setup:**
1. Download Overland from App Store
2. Open Overland settings
3. Configure endpoint:
   - **Endpoint URL:** `https://your-api-domain.com/api/gps-data/overland`
   - **Token:** Generate a secure token

**GeoPulse Configuration:**
1. Go to **Location Sources** in GeoPulse
2. Click **"Add GPS Source"**
3. Select **Overland**
4. Enter the same token from the app
5. Click **"Test Connection"** to verify
6. Save the configuration

## ⚙️ Timeline Configuration

### Adjusting Timeline Sensitivity

Go to **Timeline Preferences** to customize how GeoPulse processes your GPS data:

**Stay Detection:**
- **Minimum Stay Duration:** How long you need to be in one place (default: 10 minutes)
- **Maximum Stay Distance:** How far apart points can be in a stay (default: 100 meters)

**Trip Detection:**
- **Minimum Trip Distance:** Shortest distance to count as a trip (default: 50 meters)
- **Minimum Trip Duration:** Shortest time to count as a trip (default: 5 minutes)

**Recommended Settings:**
- **Urban areas:** Lower distance thresholds (50-100m)
- **Rural areas:** Higher distance thresholds (200-500m)
- **Walking/cycling:** Lower duration thresholds (5-10 minutes)
- **Driving only:** Higher duration thresholds (15-30 minutes)

## 🏠 Adding Favorite Locations

### From the Map
1. Go to **Timeline** page
2. Click on any location on the map
3. Select **"Add to Favorites"**
4. Choose **Point** or **Area** favorite
5. Enter a name and save

### From Location Details
1. View any timeline stay
2. Click **"Add to Favorites"** button
3. Enter a name and save

### Managing Favorites
- **Edit:** Click the edit icon next to any favorite
- **Delete:** Click the delete icon
- **Search:** Use the search box to find favorites

## 👥 Setting Up Friends

### Inviting Friends
1. Go to **Friends** page
2. Click **"Invite Friend"**
3. Enter their email address
4. They'll receive an invitation email
5. Once they accept, you can see each other's locations

### Managing Friend Invitations
- **Sent Invitations:** Cancel pending invitations
- **Received Invitations:** Accept or reject friend requests
- **Active Friends:** View current friends and their locations

### Privacy Settings
- **Location Sharing:** Toggle sharing with each friend individually
- **Data Control:** Choose what information to share
- **Temporary Sharing:** Set time limits on location sharing

## 🔗 Creating Share Links

### For Non-GeoPulse Users
1. Go to **Share Links** page
2. Click **"Create Share Link"**
3. Configure sharing options:
   - **Name:** Descriptive name for the link
   - **Date Range:** What time period to share
   - **Expiration:** When the link should stop working
   - **Password:** Optional password protection
4. Share the generated URL with anyone

### Share Link Options
- **Time-limited:** Set custom expiration dates
- **Password Protected:** Add extra security
- **View Only:** Recipients can only view, not download data

## 📊 Understanding Your Data

### Dashboard Metrics
Visit your **Dashboard** to see:
- **Distance Traveled:** Total and daily averages
- **Places Visited:** Unique locations you've stayed
- **Trip Statistics:** Number and average length of trips
- **Top Places:** Your most visited locations

### Journey Insights
Check **Journey Insights** for:
- **Countries Explored:** Visual flag display
- **Cities Visited:** Detailed city statistics
- **Achievement Levels:** Activity streaks and achievements
- **Activity Patterns:** When you're most active

### Timeline Analysis
Use the **Timeline** page to:
- **Review Daily Activities:** See stays and trips for any day
- **Analyze Patterns:** Identify regular routines
- **Explore Routes:** Visualize your actual paths on the map

## 🔧 Advanced Configuration

### Multiple GPS Sources
You can connect multiple tracking apps:
1. Add each app as a separate GPS source
2. GeoPulse will merge data from all sources
3. Duplicate points are automatically filtered

### Data Import/Export
**Import existing data:**
1. Go to **Data Export/Import**
2. Click **"Import Data"**
3. Upload OwnTracks JSON files
4. Wait for processing to complete

**Export your data:**
1. Select export format
2. Choose date range
3. Select data types to include
4. Download when complete
