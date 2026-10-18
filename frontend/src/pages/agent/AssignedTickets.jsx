import TicketListPage from '../../components/TicketListPage';
import { ticketService } from '../../services/ticketService';

export default function AssignedTickets() {
  return <TicketListPage title="Assigned Tickets" fetcher={() => ticketService.assigned()} basePath="/agent/tickets" />;
}
