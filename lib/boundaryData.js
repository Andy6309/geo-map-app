// Boundary data sources using free, publicly available GeoJSON
// These are hosted on public CDNs and don't require special permissions

export const BOUNDARY_SOURCES = {
  // US States - Higher accuracy from US Census Bureau
  // 2023 Cartographic Boundary Files (1:5,000,000 scale)
  states: {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json'
  },
  
  // US Counties - Using OpenDataDE's GeoJSON with proper FIPS codes
  // Simplified for web performance, includes 'STATE' property for filtering
  counties: {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/us_counties_20m_2018.json'
  }
};

// State name to FIPS code mapping for filtering
export const STATE_FIPS = {
  'Alabama': '01',
  'Alaska': '02',
  'Arizona': '04',
  'Arkansas': '05',
  'California': '06',
  'Colorado': '08',
  'Connecticut': '09',
  'Delaware': '10',
  'Florida': '12',
  'Georgia': '13',
  'Hawaii': '15',
  'Idaho': '16',
  'Illinois': '17',
  'Indiana': '18',
  'Iowa': '19',
  'Kansas': '20',
  'Kentucky': '21',
  'Louisiana': '22',
  'Maine': '23',
  'Maryland': '24',
  'Massachusetts': '25',
  'Michigan': '26',
  'Minnesota': '27',
  'Mississippi': '28',
  'Missouri': '29',
  'Montana': '30',
  'Nebraska': '31',
  'Nevada': '32',
  'New Hampshire': '33',
  'New Jersey': '34',
  'New Mexico': '35',
  'New York': '36',
  'North Carolina': '37',
  'North Dakota': '38',
  'Ohio': '39',
  'Oklahoma': '40',
  'Oregon': '41',
  'Pennsylvania': '42',
  'Rhode Island': '44',
  'South Carolina': '45',
  'South Dakota': '46',
  'Tennessee': '47',
  'Texas': '48',
  'Utah': '49',
  'Vermont': '50',
  'Virginia': '51',
  'Washington': '53',
  'West Virginia': '54',
  'Wisconsin': '55',
  'Wyoming': '56'
};
