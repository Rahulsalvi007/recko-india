export interface StateHierarchy {
  state: string;
  districts: {
    district: string;
    cities: string[];
  }[];
}

export const INDIAN_LOCATION_HIERARCHY: StateHierarchy[] = [
  {
    state: 'Rajasthan',
    districts: [
      {
        district: 'Udaipur',
        cities: ['Udaipur City', 'Hiran Magri', 'Fatehpura', 'Sukher', 'Bhuwana', 'Goverdhan Vilas']
      },
      {
        district: 'Jaipur',
        cities: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar', 'Tonk Road', 'Raja Park', 'C-Scheme']
      },
      {
        district: 'Jodhpur',
        cities: ['Shastri Nagar', 'Ratanada', 'Sardarpura', 'Paota']
      },
      {
        district: 'Kota',
        cities: ['Rajiv Gandhi Nagar', 'Coral Park', 'Vigyan Nagar', 'Talwandi', 'Kunhari']
      }
    ]
  },
  {
    state: 'Karnataka',
    districts: [
      {
        district: 'Bangalore Urban',
        cities: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'Electronic City', 'Marathahalli', 'Bellandur']
      },
      {
        district: 'Mysuru',
        cities: ['Gokulam', 'Vijayanagar', 'Saraswathipuram', 'Jayalakshmipuram']
      }
    ]
  },
  {
    state: 'Maharashtra',
    districts: [
      {
        district: 'Mumbai Suburban',
        cities: ['Andheri West', 'Bandra West', 'Powai', 'Malad West', 'Lower Parel', 'Juhu']
      },
      {
        district: 'Pune',
        cities: ['Hinjewadi', 'Wakad', 'Viman Nagar', 'Kothrud', 'Baner', 'Aundh']
      }
    ]
  },
  {
    state: 'Delhi NCR',
    districts: [
      {
        district: 'New Delhi',
        cities: ['Connaught Place', 'Hauz Khas', 'Saket', 'Lajpat Nagar', 'Karol Bagh', 'Satya Niketan']
      },
      {
        district: 'Gurgaon',
        cities: ['Cyber City', 'Sector 56', 'Golf Course Road', 'Sohna Road', 'DLF Phase 3']
      },
      {
        district: 'Noida',
        cities: ['Sector 62', 'Sector 18', 'Knowledge Park Greater Noida', 'Sector 137']
      }
    ]
  },
  {
    state: 'Telangana',
    districts: [
      {
        district: 'Hyderabad',
        cities: ['Gachibowli', 'HITECH City', 'Madhapur', 'Kondapur', 'Jubilee Hills', 'Banjara Hills']
      }
    ]
  },
  {
    state: 'Tamil Nadu',
    districts: [
      {
        district: 'Chennai',
        cities: ['Velachery', 'T Nagar', 'OMR', 'Adyar', 'Anna Nagar', 'Thiruvanmiyur']
      }
    ]
  }
];

export interface AIAreaSuggestion {
  targetCity: string;
  purpose: 'IT Jobs' | 'College / Coaching' | 'Family Living' | 'Commercial Business';
  recommendedAreas: string[];
  reasoning: string;
  avgRentRange: string;
  commuteHighlights: {
    walking: string;
    bike: string;
    car: string;
  };
}

export const AI_AREA_RECOMMENDATIONS: AIAreaSuggestion[] = [
  {
    targetCity: 'Jaipur',
    purpose: 'IT Jobs',
    recommendedAreas: ['Malviya Nagar', 'Vaishali Nagar', 'Mansarovar'],
    reasoning: 'Proximity to World Trade Park & Sitapura Industrial IT Zone. Excellent metro connectivity, vibrant cafes, and young professional community.',
    avgRentRange: '₹6,500 - ₹12,000 / mo',
    commuteHighlights: {
      walking: '10 min to local markets & cafes',
      bike: '12 min to Sitapura IT Tech Park',
      car: '18 min via Tonk Road / Elevated Corridor'
    }
  },
  {
    targetCity: 'Udaipur',
    purpose: 'College / Coaching',
    recommendedAreas: ['Hiran Magri', 'Fatehpura', 'Sukher'],
    reasoning: 'Located right next to Mohanlal Sukhadia University (MLSU) & RNT Medical College. High density of verified student PGs with mess facility.',
    avgRentRange: '₹4,500 - ₹8,500 / mo',
    commuteHighlights: {
      walking: '5 min to University Campus Gate',
      bike: '8 min to City Railway Station',
      car: '12 min to Fatehsagar Lake'
    }
  },
  {
    targetCity: 'Bangalore',
    purpose: 'IT Jobs',
    recommendedAreas: ['HSR Layout', 'Koramangala', 'Electronic City'],
    reasoning: 'Heart of Bangalore startup ecosystem. Walkable distance to major tech parks (Ecospace, Manyata bus shuttles), active nightlife, and green parks.',
    avgRentRange: '₹12,000 - ₹24,000 / mo',
    commuteHighlights: {
      walking: '8 min to Silk Board / HSR Metro station',
      bike: '10 min to ORR Tech Hubs',
      car: '20 min during peak traffic'
    }
  },
  {
    targetCity: 'Kota',
    purpose: 'College / Coaching',
    recommendedAreas: ['Rajiv Gandhi Nagar', 'Coral Park', 'Vigyan Nagar'],
    reasoning: 'Prime coaching hub directly adjacent to Allen & Motion institutes. Fully equipped PGs with study desks, meals, and 24/7 quiet hours.',
    avgRentRange: '₹5,000 - ₹9,500 / mo',
    commuteHighlights: {
      walking: '3 min walk to Coaching Classrooms',
      bike: '5 min to Kota Junction Train Station',
      car: '10 min to City Mall'
    }
  },
  {
    targetCity: 'Hyderabad',
    purpose: 'IT Jobs',
    recommendedAreas: ['Gachibowli', 'Madhapur', 'HITECH City'],
    reasoning: 'Direct access to Financial District, Google, Amazon & Microsoft campuses. Metro access and premium co-living spaces.',
    avgRentRange: '₹9,000 - ₹18,000 / mo',
    commuteHighlights: {
      walking: '7 min to Cyber Towers Metro Station',
      bike: '8 min to Financial District Hub',
      car: '15 min to Outer Ring Road'
    }
  }
];
