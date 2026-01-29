import { ROLE_DISPLAY } from '@/types/clan';

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const getRoleClass = () => {
    switch (role) {
      case 'leader':
        return 'role-leader';
      case 'coLeader':
        return 'role-coleader';
      case 'elder':
        return 'role-elder';
      default:
        return 'role-member';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getRoleClass()}`}>
      {ROLE_DISPLAY[role] || role}
    </span>
  );
}
