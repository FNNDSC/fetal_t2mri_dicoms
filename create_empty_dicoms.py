"""
Create some empty DICOM files in the working directory with values for SeriesDescription that commonly
appear in in-utero fetal brain MR scans, but should be ignored for the fetal brain reconstruction pipeline.
"""

from random import randint
from pydicom import uid
from pydicom.dataset import Dataset, FileMetaDataset


IMPLEMENTATION_CLASS_UID = uid.UID('2.25.484063565331375321871398394746424163706')

DATA = [
    { 'Modality': 'MR', 'SeriesDescription': '3 PLANE LOC' },
    { 'Modality': 'MR', 'SeriesDescription': 'TRUFISP-BRAIN-first scan PRESCAN ON' },
    { 'Modality': 'MR', 'SeriesDescription': 'TRUFISP-BRAIN' },
    { 'Modality': 'MR', 'SeriesDescription': 'TRUFISP-BRAIN' },
    { 'Modality': 'MR', 'SeriesDescription': 'TRUFISP-BRAIN' },
    { 'Modality': 'MR', 'SeriesDescription': 'TRUFISP-BRAIN' },
    { 'Modality': 'MR', 'SeriesDescription': '3 PLANE LOC' },
    { 'Modality': 'MR', 'SeriesDescription': 'EPI_highres_with_distortion' },
    { 'Modality': 'MR', 'SeriesDescription': 'EPI_highres_with_distortion_MoCo' },
    { 'Modality': 'MR', 'SeriesDescription': 'GEechoes3_EPI_SMS2_GRAPPA2_Echo_0' },
    { 'Modality': 'MR', 'SeriesDescription': 'GEechoes3_EPI_SMS2_GRAPPA2_Echo_1' },
    { 'Modality': 'MR', 'SeriesDescription': 'GEechoes3_EPI_SMS2_GRAPPA2_Echo_2' },
    { 'Modality': 'PR', 'SeriesDescription': 'FUJI Presentation State - ANNOTATIONS' },
    { 'Modality': 'SR', 'SeriesDescription': 'FUJI Basic Text SR for HL7 Radiological Report' },
]


def main():
    StudyInstanceUID = uid.generate_uid(None)
    for data in DATA:
        ds = Dataset()
        ds.SOPClassUID = sop_uid_for(data['Modality'])
        ds.Modality = data['Modality']
        ds.SeriesDescription = data['SeriesDescription']
        ds.ProtocolName = 'Fake file no data'

        # same as nii2dcm
        ds.PatientName = 'LastName^FirstName'
        ds.PatientID = '12345678'
        ds.AccessionNumber = 'ABCXYZ'
        ds.FrameOfReferenceUID = uid.generate_uid(None)
        ds.SOPInstanceUID = uid.generate_uid(None)
        ds.SeriesInstanceUID = uid.generate_uid(None)
        ds.StudyInstanceUID = StudyInstanceUID
        ds.InstanceNumber = '1'
        ds.SeriesNumber = str(randint(1000, 9999))        

        ds.file_meta = FileMetaDataset()
        ds.file_meta.MediaStorageSOPClassUID = ds.SOPClassUID
        ds.file_meta.MediaStorageSOPInstanceUID = ds.SOPInstanceUID
        ds.file_meta.ImplementationClassUID = IMPLEMENTATION_CLASS_UID
        ds.file_meta.TransferSyntaxUID = uid.ExplicitVRLittleEndian

        ds.save_as(f'{ds.SeriesNumber}-{ds.SeriesDescription}.dcm', write_like_original=False)


def sop_uid_for(modality: str) -> uid:
    if modality == 'MR':
        return uid.MRImageStorage
    if modality == 'PR':
        return uid.GrayscaleSoftcopyPresentationStateStorage
    if modality == 'SR':
        return uid.BasicTextSRStorage
    raise ValueError(modality)


if __name__ == '__main__':
    main()

