#!/usr/bin/env python3
"""
Build a grid of USDA hardiness zones by lat/lng coordinates.

This script reads a USDA zones shapefile and creates a JSON lookup table
mapping grid coordinates (lat, lng) to their corresponding USDA zone.
"""

import argparse
import json
import geopandas as gpd
from shapely.geometry import Point
from typing import Dict, List, Tuple


def parse_bbox(bbox_str: str) -> Tuple[float, float, float, float]:
    """Parse bbox string format: 'minx,miny,maxx,maxy'"""
    parts = bbox_str.split(',')
    if len(parts) != 4:
        raise ValueError("bbox must be in format: minx,miny,maxx,maxy")
    return tuple(float(p) for p in parts)


def build_zone_grid(
    shapefile_path: str,
    zone_field: str,
    step: float,
    bbox: Tuple[float, float, float, float],
) -> Dict[str, List[Dict]]:
    """
    Build a grid of USDA zones.
    
    Args:
        shapefile_path: Path to USDA zones shapefile
        zone_field: Name of the zone field in the shapefile
        step: Grid step size in degrees
        bbox: Bounding box (minx, miny, maxx, maxy)
    
    Returns:
        Dictionary mapping zone names to lists of lat/lng coordinates
    """
    minx, miny, maxx, maxy = bbox
    
    # Load the shapefile
    gdf = gpd.read_file(shapefile_path)
    
    zones_dict: Dict[str, List[Dict]] = {}
    
    # Generate grid points
    lng = minx
    while lng <= maxx:
        lat = miny
        while lat <= maxy:
            point = Point(lng, lat)
            
            # Check which zone this point falls into
            for idx, row in gdf.iterrows():
                if row.geometry.contains(point):
                    zone = str(row[zone_field])
                    if zone not in zones_dict:
                        zones_dict[zone] = []
                    zones_dict[zone].append({
                        "lat": lat,
                        "lng": lng,
                        "zone": zone
                    })
                    break
            
            lat += step
        lng += step
    
    return zones_dict


def main():
    parser = argparse.ArgumentParser(
        description="Build a grid of USDA hardiness zones by lat/lng coordinates"
    )
    parser.add_argument(
        "--shapefile",
        required=True,
        help="Path to USDA zones shapefile"
    )
    parser.add_argument(
        "--zone-field",
        required=True,
        help="Name of the zone field in the shapefile"
    )
    parser.add_argument(
        "--step",
        type=float,
        default=0.25,
        help="Grid step size in degrees (default: 0.25)"
    )
    parser.add_argument(
        "--bbox",
        required=True,
        help="Bounding box in format: minx,miny,maxx,maxy"
    )
    parser.add_argument(
        "--out",
        required=True,
        help="Output JSON file path"
    )
    
    args = parser.parse_args()
    
    try:
        bbox = parse_bbox(args.bbox)
        zones = build_zone_grid(
            args.shapefile,
            args.zone_field,
            args.step,
            bbox
        )
        
        # Write output
        with open(args.out, 'w') as f:
            json.dump(zones, f, indent=2)
        
        print(f"Successfully wrote {len(zones)} zones to {args.out}")
        
    except Exception as e:
        print(f"Error: {e}", file=__import__('sys').stderr)
        return 1


if __name__ == "__main__":
    main()
