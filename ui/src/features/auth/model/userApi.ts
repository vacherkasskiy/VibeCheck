import http from 'shared/api/http';

export type Sex = 'SEX_MALE' | 'SEX_FEMALE' | 'SEX_OTHER';

export type EducationLevel = 'EDUCATION_LEVEL_NONE' | 'EDUCATION_LEVEL_PRIMARY' | 'EDUCATION_LEVEL_BASIC' | 'EDUCATION_LEVEL_SECONDARY' | 'EDUCATION_LEVEL_SECONDARY_PROFESSIONAL' | 'EDUCATION_LEVEL_INCOMPLETE_HIGHER' | 'EDUCATION_LEVEL_BACHELOR' | 'EDUCATION_LEVEL_SPECIALIST' | 'EDUCATION_LEVEL_MASTER' | 'EDUCATION_LEVEL_POSTGRADUATE' | 'EDUCATION_LEVEL_DOCTORATE' | 'EDUCATION_LEVEL_RESIDENCY' | 'EDUCATION_LEVEL_ADJUNCTURE';

export type Specialization = 'SPECIALTY_IT' | 'SPECIALTY_DESIGN' | 'SPECIALTY_MARKETING' | 'SPECIALTY_FINANCE' | 'SPECIALTY_HR' | 'SPECIALTY_SALES' | 'SPECIALTY_LOGISTICS' | 'SPECIALTY_LAW' | 'SPECIALTY_EDUCATION' | 'SPECIALTY_MEDICINE' | 'SPECIALTY_CONSTRUCTION' | 'SPECIALTY_ENGINEERING' | 'SPECIALTY_ART' | 'SPECIALTY_TOURISM' | 'SPECIALTY_MEDIA' | 'SPECIALTY_ANALYTICS' | 'SPECIALTY_PROJECT_MANAGEMENT' | 'SPECIALTY_SPORT' | 'SPECIALTY_OTHER';

export interface WorkExperienceDto {
  specialization: Specialization;
  startedAt: string;
  finishedAt: string | null;
}

export interface CreateOrUpdateUserInfoDto {
  name: string;
  iconId: string;
  sex: Sex;
  birthday: string;
  education: EducationLevel;
  specialization: Specialization;
  workExperience?: WorkExperienceDto[];
}

export interface UserInfoDto {
  name: string;
  iconId: string;
  email: string;
  sex: Sex;
  birthday: string;
  education: EducationLevel;
  specialization: Specialization;
  workExperience: WorkExperienceDto[];
}

export interface AvatarDto {
  iconId: string;
  link: string;
}

export const mapEducation = (mockEducation: string): EducationLevel => {
  const map: Record<string, EducationLevel> = {
    NONE: 'EDUCATION_LEVEL_NONE',
    SCHOOL: 'EDUCATION_LEVEL_SECONDARY',
    COLLEGE: 'EDUCATION_LEVEL_SECONDARY_PROFESSIONAL',
    BACHELOR: 'EDUCATION_LEVEL_BACHELOR',
    MASTER: 'EDUCATION_LEVEL_MASTER',
    SPECIALIST: 'EDUCATION_LEVEL_SPECIALIST',
    PHD: 'EDUCATION_LEVEL_POSTGRADUATE',
    DOCTORATE: 'EDUCATION_LEVEL_DOCTORATE',
  };
  return map[mockEducation as keyof typeof map] || 'EDUCATION_LEVEL_NONE';
};

export const mapIndustryToSpecialization = (mockIndustry: string): Specialization => {
  const map: Record<string, Specialization> = {
    IT: 'SPECIALTY_IT',
    FINANCE: 'SPECIALTY_FINANCE',
    MEDIA: 'SPECIALTY_MEDIA',
    EDUCATION: 'SPECIALTY_EDUCATION',
    HEALTHCARE: 'SPECIALTY_MEDICINE',
    MANUFACTURING: 'SPECIALTY_ENGINEERING',
    RETAIL: 'SPECIALTY_SALES',
    HOSPITALITY: 'SPECIALTY_TOURISM',
    TRANSPORT: 'SPECIALTY_LOGISTICS',
    CONSTRUCTION: 'SPECIALTY_CONSTRUCTION',
    ENERGY: 'SPECIALTY_OTHER',
    AGRICULTURE: 'SPECIALTY_OTHER',
    GOVERNMENT: 'SPECIALTY_OTHER',
    NGO: 'SPECIALTY_OTHER',
    OTHER: 'SPECIALTY_OTHER',
  };
  return map[mockIndustry as keyof typeof map] || 'SPECIALTY_OTHER';
};

export const mapMockExperience = (exp: { industry: string; startDate: string; endDate: string | null }): WorkExperienceDto => ({
  specialization: mapIndustryToSpecialization(exp.industry),
  startedAt: exp.startDate,
  finishedAt: exp.endDate,
});

export const createUserInfoDto = (formData: {
  email: string;
  avatarId: string;
  nickname: string;
  sex: Sex;
  birthDate: string; 
  education: string;
  industry: string;
  experiences: Array<{ industry: string; startDate: string; endDate: string | null }>;
}): CreateOrUpdateUserInfoDto => ({
  name: formData.nickname,
  iconId: formData.avatarId,
  sex: formData.sex,
  birthday: formData.birthDate,
  education: mapEducation(formData.education),
  specialization: mapIndustryToSpecialization(formData.industry),
  workExperience: formData.experiences.map(mapMockExperience),
});

export const getAvatars = async (): Promise<AvatarDto[]> => {
  const res = await http.get<AvatarDto[]>('/avatars');
  return res.data;
};

export const getMyInfo = async (): Promise<UserInfoDto> => {
  const res = await http.get<UserInfoDto>('/users/me/info');
  return res.data;
};

export const updateMyInfo = async (dto: CreateOrUpdateUserInfoDto): Promise<UserInfoDto> => {
  const res = await http.post<UserInfoDto>('/users/info', dto);
  return res.data;
};

export const saveUserPreferences = async (_prefs: any) => {
  return { success: true };
};

