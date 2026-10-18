import TicketListPage from '../../components/TicketListPage';
import { ticketService } from '../../services/ticketService';

export default function MyTickets() {
  return <TicketListPage title="My Tickets" fetcher={() => ticketService.my()} basePath="/customer/tickets" />;
}
