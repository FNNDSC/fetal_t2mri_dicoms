const ORTHANC_URL = 'http://localhost:8042';

const FETAL_BRAIN_DESCRIPTIONS = [
  'T2 FETAL Uterus',
  'T2 FETAL Uterus',
  'T2 FETAL Uterus',
  'CERVIX T2 HASTE with prescan ON',
  'T2 HASTE 4 concat short TR',
  'T2 HASTE 4 concat short TR',
  'T2 HASTE 4 concat short TR',
  'CERVIX T2 HASTE PRE SCAN( RUN COR AND SAG TO MOM) (UTERUS)'
];

const FETAL_BRAIN_TAGS = {
  BodyPartExamined: 'PELVIS',
  Manufacturer: 'SIEMENS',
  PerformedProcedureStepDescription: 'MR Fetal',
  InstitutionName: 'The ChRIS Hospital',
  ReferringPhysicianName: 'REFERRING^SELF^REFERRED/NO^^PA',
  RequestingPhysician: 'PIENAAR, RUDOLPH',
  PhysiciansOfRecord: 'UNKNOWN^UNKNOWN',
  PerformingPhysicianName: 'ZHANG, JENNINGS'
};

const FAKE_PATIENTS = [
  { PatientID: '9726543', PatientName: 'Mae Hills',      PatientBirthDate: '19981015', PatientAge: '026Y', AccessionNumber: '22805343', StudyDate: '20241022', StudyTime: '104249.315000', StudyDescription: 'Fetal Neuro Indications' },
  { PatientID: '7059866', PatientName: 'Marcia Beahan',  PatientBirthDate: '19940808', PatientAge: '030Y', AccessionNumber: '50394804', StudyDate: '20240612', StudyTime: '92077',         StudyDescription: 'Fetal Neuro Indications' },
  { PatientID: '2285408', PatientName: 'Danielle Ferry', PatientBirthDate: '19970322', PatientAge: '027Y', AccessionNumber: '30825441', StudyDate: '20231130', StudyTime: '92771',         StudyDescription: 'EI Fetal Neuro' },
];

main();

async function main() {

  // (1) Find all studies produced by the nii2dcm tool.
  // ------------------------------------------------------------------
  const studyIds = await fetchJson(`${ORTHANC_URL}/tools/find`, {
    Level: 'Study',
    Query: {
      PatientName: 'LastName^FirstName',
      PatientID: '12345678',
      AccessionNumber: 'ABCXYZ'
    }
  });

  // (2) Modify all of the studies so that they share a StudyInstanceUID.
  // ------------------------------------------------------------------
  const originalStudy = await fetchJson(`${ORTHANC_URL}/studies/${studyIds[0]}`);
  const originalPatientId = originalStudy.ParentPatient;
  const originalStudyInstanceUID = originalStudy.MainDicomTags.StudyInstanceUID;
  const modifyOriginalPromises = studyIds.map((id) => (
    fetchJson(`${ORTHANC_URL}/studies/${id}/modify`, {
      Synchronous: true,
      KeepSource: true,
      Remove: ['StudyDate', 'StudyTime'],
      Force: true,
      Replace: {
        PatientID: '87654321',
        StudyInstanceUID: originalStudyInstanceUID
      }
    })
  ));
  const modifiedStudies = await Promise.all(modifyOriginalPromises);
  const modifiedPatientId = modifiedStudies[0].PatientID;

  // (3) Add fake metadata to the series.
  // ------------------------------------------------------------------
  const series = await fetchJson(`${ORTHANC_URL}${modifiedStudies[0].Path}/series`);
  const seriesDescriptions = fetalBrainDescriptions();
  const seriesPromises = series
    .filter((s) => s.MainDicomTags.ProtocolName !== 'Fake file no data')
    .map((s, i) => {
      const SeriesDescription = seriesDescriptions.next().value;
      return fetchJson(`${ORTHANC_URL}/series/${s.ID}/modify`, {
        Synchronous: true,
        KeepSource: false,
        Replace: {
          SeriesDescription,
          ProtocolName: SeriesDescription,
          SeriesNumber: `${i + 1}`,
          ...FETAL_BRAIN_TAGS,
        }
      });
    });
  await Promise.all(seriesPromises);

  // (4) Copy study and add fake patient data.
  // ------------------------------------------------------------------
  const studyPromises = FAKE_PATIENTS.map((patientStudy) => (
    fetchJson(`${ORTHANC_URL}/studies/${series[0].ParentStudy}/modify`, {
      Synchronous: true,
      KeepSource: true,
      Force: true,
      Replace: { ...patientStudy }
    })
  ));
  const goodStudies = await Promise.all(studyPromises);

  // (7) Clean up original data.
  // ------------------------------------------------------------------
  await Promise.all([
    fetchJson(`${ORTHANC_URL}/patients/${originalPatientId}`, null, 'DELETE'),
    fetchJson(`${ORTHANC_URL}/patients/${modifiedPatientId}`, null, 'DELETE')
  ]);
}

async function fetchJson(url, data, method, string) {
  const headers = {
    Accept: 'application/json'
  };
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  method = method ?? (data ? 'POST' : 'GET');
  const body = data ? JSON.stringify(data) : undefined;
  console.log(method, url);
  const res = await fetch(url, { method, body, headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} - ${await res.text()}`)
  }
  return res.json();
}

function* fetalBrainDescriptions() {
  while (true) {
    for (const x of FETAL_BRAIN_DESCRIPTIONS) {
      yield x;
    }
  }
}
