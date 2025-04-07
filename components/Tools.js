import { useQuery, gql } from '@apollo/client';

const GET_WAYPOINTS = gql`
  query {
    waypoints {
      id
      latitude
      longitude
    }
  }
`;

const Map = () => {
    const { loading, error, data } = useQuery(GET_WAYPOINTS);

    useEffect(() => {
        if (!loading && data) {
            data.waypoints.forEach(wp => {
                new mapboxgl.Marker()
                    .setLngLat([wp.longitude, wp.latitude])
                    .addTo(map);
            });
        }
    }, [data]);

    return <div id="map" style={{ width: "100%", height: "500px" }} />;
};
