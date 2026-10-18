import TicketListPage from '../../components/TicketListPage';
import { ticketService } from '../../services/ticketService';

export default function EscalatedTickets() {
  return (
    <TicketListPage
      title="Escalated Tickets"
      fetcher={() => ticketService.all({ status: 'ESCALATED' })}
      basePath="/senior/tickets"
      hideStatus
    />
  );
}
