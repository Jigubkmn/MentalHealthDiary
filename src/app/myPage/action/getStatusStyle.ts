import { StatusStyle } from "../../../../type/statusStyle";

export default function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case 'block':
      return {
        text: 'ブロック',
        backgroundColor: '#8D8D8D',
        textColor: '#FFFFFF'
      };
    case 'pending':
      return {
        text: '申請中',
        backgroundColor: '#28C228',
        textColor: '#FFFFFF'
      };
    case 'pendingApproval':
      return {
        text: '承認待ち',
        backgroundColor: '#28C228',
        textColor: '#FFFFFF'
      };
    case 'unApproved':
      return {
        text: '未承認',
        backgroundColor: '#8D8D8D',
        textColor: '#FFFFFF'
      };
    case 'approval':
      return {
        text: '承認済み',
        backgroundColor: '#FFA500',
        textColor: '#FFFFFF'
      };
    default:
      return {
        text: '不明',
        backgroundColor: 'rgba(128, 128, 128, 0.6)',
        textColor: '#FFFFFF'
      };
  }
};