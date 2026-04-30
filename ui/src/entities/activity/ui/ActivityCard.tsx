import { MessageSquare, ThumbsUp, Award, UserPlus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityCard.module.css';
import type { UserFeedDto, PayloadType, ReviewWrittenInfoDto, ReviewLikedInfoDto, AchievementGrantedInfoDto, UserFollowedInfoDto, UserLevelUpInfoDto } from '../model/types';

const AVATARS = [
  '/assets/avatars/avatar1.png',
  '/assets/avatars/avatar2.png',
];

const getAvatarUrl = (iconId?: string) => {
  if (!iconId) return '/assets/avatars/default.png';
  const avatar = AVATARS.find(a => a.includes(iconId));
  return avatar || '/assets/avatars/default.png';
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  if (diff < 60 * 1000) return 'только что';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} мин назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

interface ActivityCardProps {
  activity: UserFeedDto;
}

export const ActivityCard = ({ activity }: ActivityCardProps) => {
  const navigate = useNavigate();

  if (!activity.payload || !activity.actor) {
    return <div className={styles.card}>Неизвестное событие</div>;
  }

  const actorName = activity.actor.name || 'Пользователь';
  const createdAt = activity.createdAt ? formatRelativeTime(new Date(activity.createdAt)) : '';

  const getIcon = (type: PayloadType) => {
    switch (type) {
      case 'REVIEW_WRITTEN':
        return MessageSquare;
      case 'REVIEW_LIKED':
        return ThumbsUp;
      case 'ACHIEVEMENT_UNLOCKED':
        return Award;
      case 'USER_FOLLOWED':
        return UserPlus;
      case 'LEVEL_UP':
        return Star;
      default:
        return MessageSquare;
    }
  };

  const Icon = getIcon(activity.payload.type);

  let text = 'Новое событие';
  let onClick: (() => void) | undefined;

  switch (activity.payload.type) {
    case 'REVIEW_WRITTEN':
      text = `${actorName} оставил(а) отзыв о компании ${activity.payload.companyName || 'компании'}`;
      if ((activity.payload as ReviewWrittenInfoDto).companyId) {
        onClick = () => navigate(`/company/${(activity.payload as ReviewWrittenInfoDto).companyId}`);
      }
      break;
    case 'REVIEW_LIKED':
      text = `${actorName} оценил(а) отзыв о компании ${activity.payload.companyName || 'компании'}`;
      if ((activity.payload as ReviewLikedInfoDto).companyId) {
        onClick = () => navigate(`/company/${(activity.payload as ReviewLikedInfoDto).companyId}`);
      }
      break;
    case 'ACHIEVEMENT_UNLOCKED':
      text = `${actorName} получил(а) достижение «${activity.payload.displayName || 'неизвестное'}»`;
      break;
    case 'USER_FOLLOWED':
      text = `${actorName} подписался(ась) на ${activity.payload.displayName || 'пользователя'}`;
      if ((activity.payload as UserFollowedInfoDto).userId) {
        onClick = () => navigate(`/user/${(activity.payload as UserFollowedInfoDto).userId}`);
      }
      break;
    case 'LEVEL_UP':
      text = `${actorName} достиг(ла) уровня ${activity.payload.newLevel || '?'}`;
      break;
  }

  const avatarUrl = getAvatarUrl(activity.actor.iconId);

  return (
    <div
      className={styles.card}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onClick();
        }
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.avatar}>
        <img src={avatarUrl} alt={actorName} />
      </div>
      <div className={styles.content}>
        <div className={styles.text}>
          <Icon size={16} className={styles.icon} />
          <span className={styles.mainText}>{text}</span>
        </div>
        {createdAt && <span className={styles.time}>{createdAt}</span>}
      </div>
    </div>
  );
};
