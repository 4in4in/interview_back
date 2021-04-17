class ClientsList extends HTMLElement {
  connectedCallback() {
    console.log('ClientsList component created');

    // const template = document.getElementById('clients_list_template');
    const shadow = this.attachShadow({ mode: 'open' });
    // shadow.append(template.content.cloneNode(true));

    this.clients = [];

    ClientsList.connection.on('clientsChanged', () => this.renderList()); /**/
    this.renderList();
  }

  async renderList() {
    await this.loadClients(); /**/
    this.drawClients();
  }

  async loadClients() {
    const urlRequest = `${ClientsList.clientsServer}/connections`;
    console.log('loadClients method: '+urlRequest);
    const response = await fetch(urlRequest);
    const data = await response.json();
    this.clients = data.clients.filter(
      (remoteClient) => remoteClient !== ClientsList.connection.id
    );
  }

  drawClients() {
    // const clientsList = this.shadowRoot.getElementById('client_list_content');

    // while (clientsList.firstChild) {
    //   clientsList.removeChild(clientsList.firstChild);
    // }

    // this.clients.forEach((client) => {
    //   const clientRow = document.createElement('div');
    //   clientRow.className = 'client_row';
    //   clientRow.innerText =
    //     client.length < 20 ? client : client.slice(0, 19) + '...';
    //   clientRow.onclick = () => this.createConnection(client);
    //   clientsList.appendChild(clientRow);
    // });

    if (this.clients.length > 0) {
      this.createConnection(this.clients[0]); ////// если есть кандидат на звонок, устанавливаем соединение
    }
  }

  async createConnection(called) {
    const caller = ClientsList.connection.id;
    const urlRequest = `${ClientsList.clientsServer}/connections?caller=${caller}&called=${called}`;
    console.log('createConnection method: '+urlRequest);
    await fetch(urlRequest, { method: 'put' });
  }
}

export default ClientsList;
