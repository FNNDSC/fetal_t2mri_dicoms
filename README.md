# Sample _in-utero_ Fetal Brain MRI DICOMs in Orthanc

This repository contains scripts for downloading a dataset of _in-utero_ fetal brain T2-weighted MRI data,
converting it to DICOMs, and using Orthanc to add fake patient and study metadata.

The intended use is for testing https://github.com/FNNDSC/fetal-recon-ui-mvp

The source data is publicly available data from https://github.com/bchimagine/fetal-brain-extraction_t2w

## Output

Running all the scripts produces 3 patients in Orthanc, each with one study. All patient data
(PatientID, PatientName, PatientName, PatientBirthDate, PatientAge) are fake and random.

The studies are called:

- Fetal Neuro Indications
- Fetal Neuro Indications
- EI Fetal Neuro

All three studies have the same data. The SeriesDescriptions are:

- 3 PLANE LOC
- 3 PLANE LOC
- CERVIX T2 HASTE PRE SCAN( RUN COR AND SAG TO MOM) (UTERUS)
- CERVIX T2 HASTE with prescan ON
- EPI_highres_with_distortion
- EPI_highres_with_distortion_MoCo
- FUJI Basic Text SR for HL7 Radiological Report
- FUJI Presentation State - ANNOTATIONS
- GEechoes3_EPI_SMS2_GRAPPA2_Echo_0
- GEechoes3_EPI_SMS2_GRAPPA2_Echo_1
- GEechoes3_EPI_SMS2_GRAPPA2_Echo_2
- T2 FETAL Uterus
- T2 FETAL Uterus
- T2 FETAL Uterus
- T2 HASTE 4 concat short TR
- T2 HASTE 4 concat short TR
- T2 HASTE 4 concat short TR
- TRUFISP-BRAIN
- TRUFISP-BRAIN
- TRUFISP-BRAIN
- TRUFISP-BRAIN
- TRUFISP-BRAIN-first scan PRESCAN ON

Every series containing the word "T2" contains a fetal brain MRI **stack**.
Other files do not contain PixelData.

## Usage

```shell
# clone this repository
git clone https://github.com/FNNDSC/fetal_t2mri_dicoms.git
cd fetal_t2mri_dicoms

# download NIFTI data, convert to DICOM, and create fake DICOMs
./download_and_dicomize.sh

# upload to a local Orthanc (w/o authentication)
./upload2orthanc.sh

# add metadata and create copies of datasets in Orthanc
node modifyInOrthanc.js
```

