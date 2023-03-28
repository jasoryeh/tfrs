const convert = require('xml-js')

const baseURI = 'https://tfr.faa.gov/save_pages/'

// Main method / shortcut to fetch
const tfrs = (module.exports = (...args) => {
  return tfrs.fetch(...args)
})

/**
 * Verify a date string matches the format mm/dd/yyyy
 */
const isDate = text => {
  if (!text) { return false; }
  const [ mm, dd, yyyy ] = text.split('/')
  if (!mm || mm.length !== 2 || !parseInt(mm)) {
    return false
  }
  if (!dd || dd.length !== 2 || !parseInt(dd)) {
    return false
  }
  if (!yyyy || yyyy.length !== 4 || !parseInt(yyyy)) {
    return false
  }
  return true
}

/**
 * List all TFRs available on https://tfr.faa.gov
 */
tfrs.list = async () => {
  const response = await fetch('https://tfr.faa.gov/tfr2/list.jsp', {
    method: "GET"
  });

  const rows = [];
  var current = [];
  await new HTMLRewriter().on("tr", {
    element(element) {
      if (current.length > 0) {
        rows.push(current);
      }
      console.log(element);
      current = [];
    }
  }).on("tr a", {
    element(element) {
      current.push({
        href: element.getAttribute('href'),
        tagName: element.tagName
      })
    },
    text(text) {
      current[current.length - 1].text = (current[current.length - 1].text ?? "") + text.text;
    }
  }).transform(response).arrayBuffer();
  if (current.length > 0) {
    rows.push(current);
  }

  const results = rows.map(columns => {
    console.log(columns);
    const date = columns[0].text
    if (!isDate(date)) {
      return;
    }

    return {
      date,
      notam: columns[1].text,
      facility: columns[2].text,
      state: columns[3].text,
      type: columns[4].text,
      description: columns[5]
        .text
        .replace(/\n|\r/g, ''),
      links: {
        details: columns[1]
          .href
          .replace('..', 'https://tfr.faa.gov')
          .replace(/\n|\r/g, ''),
        zoom: columns[6] ? `https://tfr.faa.gov${columns[6].href}` : null,
        xml: columns[1]
          .href
          .replace('..', 'https://tfr.faa.gov')
          .replace('html', 'xml')
          .replace(/\n|\r/g, '')
      }
    }
  });
  return results.filter(r => !!r)
}

/**
 * Extract the NotUid fields
 */
const extractNotUid = notUid => ({
  accountableFacility: notUid.txtNameAcctFac._text,
  indexYear: notUid.dateIndexYear._text,
  sequenceNumber: notUid.noSeqNo._text,
  localName: notUid.txtLocalName._text,
  guid: notUid.codeGUID._text
})

/**
 * Extract the airspace schedule fields
 */
const extractAirspaceSchedule = ScheduleGroup => {
  if (
    !ScheduleGroup ||
    (!ScheduleGroup.isTimeSeparate &&
      !ScheduleGroup.dateEffective &&
      !ScheduleGroup.dateExpire)
  ) {
    return null
  }
  return {
    isTimeSeparate: ScheduleGroup.isTimeSeparate
      ? ScheduleGroup.isTimeSeparate._text
      : null,
    dateEffective: ScheduleGroup.dateEffective
      ? ScheduleGroup.dateEffective._text
      : null,
    dateExpire: ScheduleGroup.dateExpire ? ScheduleGroup.dateExpire._text : null
  }
}

/**
 * Extract the airspace boundary data
 */
const extractBoundary = TFRAreaGroup => {
  if (!TFRAreaGroup.abdMergedArea) {
    return null
  }
  return {
    airspaceType: TFRAreaGroup.abdMergedArea.AbdUid
      ? TFRAreaGroup.abdMergedArea.AbdUid.AseUid.codeType._text
      : null,
    airspaceId: TFRAreaGroup.abdMergedArea.AbdUid
      ? TFRAreaGroup.abdMergedArea.AbdUid.AseUid.codeId._text
      : null,
    remark: TFRAreaGroup.abdMergedArea.txtRmk._text,
    datum: TFRAreaGroup.abdMergedArea.Avx[0].codeDatum._text,
    type: TFRAreaGroup.abdMergedArea.Avx[0].codeType._text,
    vertices: TFRAreaGroup.abdMergedArea.Avx.map(avx => {
      let lat = avx.geoLat._text
      if (lat.includes('S')) {
        lat = -1 * parseFloat(lat.replace('S', ''))
      } else {
        lat = parseFloat(lat.replace('N', ''))
      }
      let long = avx.geoLong._text
      if (long.includes('W')) {
        long = -1 * parseFloat(long.replace('W', ''))
      } else {
        long = parseFloat(long.replace('E', ''))
      }
      return [ lat, long ]
    })
  }
}

/**
 * Extract a single TFRAreaGroup/Airspace group
 */
const extractAirspaceGroup = TFRAreaGroup => {
  return {
    airspaceType: TFRAreaGroup.aseTFRArea.AseUid.codeType._text,
    airspaceId: TFRAreaGroup.aseTFRArea.AseUid.codeId._text,
    name: TFRAreaGroup.aseTFRArea.txtName
      ? TFRAreaGroup.aseTFRArea.txtName._text
      : null,
    distVerUpperCode: TFRAreaGroup.aseTFRArea.codeDistVerUpper
      ? TFRAreaGroup.aseTFRArea.codeDistVerUpper._text
      : null,
    distVerUpperValue: TFRAreaGroup.aseTFRArea.valDistVerUpper
      ? TFRAreaGroup.aseTFRArea.valDistVerUpper._text
      : null,
    distVerUpperUnit: TFRAreaGroup.aseTFRArea.uomDistVerUpper
      ? TFRAreaGroup.aseTFRArea.uomDistVerUpper._text
      : null,
    distVerLowerCode: TFRAreaGroup.aseTFRArea.codeDistVerLower
      ? TFRAreaGroup.aseTFRArea.codeDistVerLower._text
      : null,
    distVerLowerValue: TFRAreaGroup.aseTFRArea.valDistVerLower
      ? TFRAreaGroup.aseTFRArea.valDistVerLower._text
      : null,
    distVerLowerUnit: TFRAreaGroup.aseTFRArea.uomDistVerLower
      ? TFRAreaGroup.aseTFRArea.uomDistVerLower._text
      : null,
    airspaceTimesheetWorkHr: TFRAreaGroup.aseTFRArea.Att.codeWorkHr._text,
    excludeVerUpper: TFRAreaGroup.aseTFRArea.codeExclVerUpper._text,
    excludeVerLower: TFRAreaGroup.aseTFRArea.codeExclVerLower._text,
    isScheduledTfrArea: TFRAreaGroup.aseTFRArea.isScheduledTfrArea._text,
    schedule: extractAirspaceSchedule(TFRAreaGroup.aseTFRArea.ScheduleGroup),
    boundary: extractBoundary(TFRAreaGroup),
    incFRD: TFRAreaGroup.codeIncFRD._text,
    shpPrt: TFRAreaGroup.codeShpPrt._text,
    localTime: TFRAreaGroup.codeLclTime._text,
    authATC: TFRAreaGroup.codeAuthATC._text
  }
}

/**
 * Extract one or more airspace groups
 */
const extractAirspaceGroups = tfrNot => {
  if (Array.isArray(tfrNot.TFRAreaGroup)) {
    return tfrNot.TFRAreaGroup.map(extractAirspaceGroup)
  }
  if (typeof tfrNot.TFRAreaGroup === 'object') {
    return extractAirspaceGroup(tfrNot.TFRAreaGroup)
  }
  return null
}

/**
 * Extract the TfrNot fields
 */
const extractTfrNot = tfrNot => {
  return {
    type: tfrNot.codeType._text,
    airspace: extractAirspaceGroups(tfrNot)
    // aac: tfrNot.TFRAreaGroup.Aac,
    // aseShapes: tfrNot.TFRAreaGroup.aseShapes
  }
}

/**
 * Extract POC/point-of-contact fields
 */
const extractPoc = not => {
  if (!not.notTxtNamePOC && !not.txtAddrPOCPhone) {
    return null
  }
  return {
    name: not.txtNamePOC ? not.txtNamePOC._text : null,
    phone: not.txtAddrPOCPhone ? not.txtAddrPOCPhone._text : null
  }
}

/**
 * Extract all fields from the transformed XML
 */
const extractNot = not => ({
  ...extractNotUid(not.NotUid),
  dailyOperations: not.codeDailyOper._text,
  dateIssued: not.NotUid.dateIssued._text,
  dateEffective: not.dateEffective ? not.dateEffective._text : null,
  dateExpires: not.dateExpire ? not.dateExpire._text : null,
  timezone: not.codeTimeZone._text,
  expirationTimezone: not.codeExpirationTimeZone._text,
  facility: {
    id: not.codeFacility._text,
    type: not.codeCoordFacilityType._text,
    location: {
      city: not.AffLocGroup.txtNameCity
        ? not.AffLocGroup.txtNameCity._text
        : null,
      state: not.AffLocGroup.txtNameUSState._text
    }
  },
  poc: extractPoc(not),
  ...extractTfrNot(not.TfrNot),
  description: {
    freeFormText: not.codeFreeformText._text,
    usns: not.txtDescrUSNS._text,
    traditional: not.txtDescrTraditional._text
  }
})

/**
 * Fetch the XML version of the TFR and transform it into a simpler JSON format
 */
const fetchJson = async id => {
  const response = await fetch(`${baseURI}/detail_${id.split('/').join('_')}.xml`, {
    method: "GET"
  });

  const result = parse(
    (await response.text()).replace(/<txtDescrModern[\s\S]*txtDescrModern>/g, '')
  )

  return {
    id,
    created: result['XNOTAM-Update']._attributes.created,
    ...extractNot(result['XNOTAM-Update'].Group.Add.Not)
  }
}

/**
 * Main fetching method used to get TFR details
 */
tfrs.fetch = async (id) => {
  try {
    return fetchJson(id);
  } catch (err) {
    console.error(`Error fetching TFR values from ${baseURI}`, err)
  }
}

/**
 * Convert the XML version of the TFR into JSON for further processing
 */
const parse = xml => {
  const js = convert.xml2js(xml, {
    compact: true
  })
  return js
}
