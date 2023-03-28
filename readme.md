# tfrs

Fetch temporary flight restrictions and related data from https://tfr.faa.gov

[![NPM Version][npm-image]][npm-url]

## Deploy
```
$ wrangler publish
```

## Live
Currently published to `https://tfrs.jasonho.workers.dev`

## Usage
GET `/`
  List the current TFRs.
  ```json
  [
    {
        "date": "03/28/2023",
        "notam": "3/3194",
        "facility": "ZTL",
        "state": "GA",
        "type": "SECURITY",
        "description": "Augusta, GA, Saturday, April 01, 2023 through Sunday, April 09, 2023 Local New  ",
        "links": {
            "details": "https://tfr.faa.gov/save_pages/detail_3_3194.html",
            "zoom": "https://tfr.faa.gov/tfr_map_ims/html/ew/scale3/tile_4_3.html",
            "xml": "https://tfr.faa.gov/save_pages/detail_3_3194.xml"
        }
    },
    ...
  ]
  ```

GET `/<NOTAM/ID>`
  Get details for a specific TFR by NOTAM ID (e.g. Disney World: /4/3634).
  ```json
  {
    "id": "4/3634",
    "created": "2023-03-21T14:32:19",
    "accountableFacility": "FDC",
    "indexYear": "2014",
    "sequenceNumber": "3634",
    "localName": "4/3634",
    "guid": "a3b4391f-b089-4bde-be42-463bcd6ef4b9",
    "dailyOperations": "false",
    "dateIssued": "2014-10-27T14:57:00",
    "dateEffective": "2014-10-27T15:00:00",
    "dateExpires": null,
    "timezone": "UTC",
    "expirationTimezone": "UTC",
    "facility": {
        "id": "ZJX",
        "type": "ARTCC",
        "location": {
            "city": "DISNEY WORLD THEME PARK, ORLANDO",
            "state": "FLORIDA"
        }
    },
    "poc": null,
    "type": "99.7",
    "airspace": {
        "airspaceType": "RAS",
        "airspaceId": "11448",
        "name": "Area",
        "distVerUpperCode": "HEI",
        "distVerUpperValue": "3000",
        "distVerUpperUnit": "FT",
        "distVerLowerCode": "HEI",
        "distVerLowerValue": "0",
        "distVerLowerUnit": "FT",
        "airspaceTimesheetWorkHr": "NOTAM",
        "excludeVerUpper": "INCLUDE",
        "excludeVerLower": "INCLUDE",
        "isScheduledTfrArea": "FALSE",
        "schedule": {
            "isTimeSeparate": "FALSE",
            "dateEffective": "2014-10-27T15:00:00",
            "dateExpire": null
        },
        "boundary": {
            "airspaceType": "RAS",
            "airspaceId": "11448",
            "remark": "11448",
            "datum": "WGE",
            "type": "GRC",
            "vertices": [
                [...], ... 
            ]
        },
        "incFRD": "TRUE",
        "shpPrt": "COMPOSITE",
        "localTime": "TRUE",
        "authATC": "FALSE"
    },
    "description": {
        "freeFormText": "false",
        "usns": "...",
        "traditional": "..."
    }
}
  ```

## Contributing

Contributions welcome!

## License

MIT © [Forrest Desjardins](https://github.com/fdesjardins)

[npm-url]: https://www.npmjs.com/package/@faa-aviation-data-portal/tfrs
[npm-image]: https://img.shields.io/npm/v/@faa-aviation-data-portal/tfrs.svg?style=flat
