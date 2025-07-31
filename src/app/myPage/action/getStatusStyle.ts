import { StatusStyle } from "../../../../type/statusStyle";

export default function getStatusStyle(status: string): StatusStyle {
  switch (status) {
    case 'block':
      return {
        text: 'ブロック中',
        backgroundColor: '#8D8D8D',
        textColor: '#FFFFFF'
      };
    case 'unavailable':
      return {
        text: '閲覧不可',
        backgroundColor: '#8D8D8D',
        textColor: '#FFFFFF'
      };
    case 'pending':
      return {
        text: '申請中',
        backgroundColor: '#28C228',
        textColor: '#FFFFFF'
      };
    case 'awaitingApproval':
      return {
        text: '承認受付中 ',
        backgroundColor: '#28C228',
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