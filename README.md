# Agent 360 Lookup (Tawuniya CX, Sutherland x Denodo POC)

Illustrative UI for the Agent 360 customer lookup. One search by National ID, Iqama number or policy number
shows every policy (active and inactive), the endorsements under each policy, and any active exception
(error) for that customer, across Health and Motor.

Sources shown: Informatica MDM (identity, relationships, contact, consent), Medgo (Health), Motor core (Motor).

## Run
Open `index.html` in a browser. No build step.

## Structure
* `index.html`: the screen (HTML, CSS, vanilla JS)
* `data/customers.js`: dummy data (all names, IDs and figures are invented)
* `assets/tawuniya-logo.png`: header logo (swap the file to change it)
* `deck/`: the POC proposal deck draft

## Demo values
* National ID `1087654321` (Health and Motor, 1 exception), `1098765432`, `1076543210` (inactive only, no exceptions)
* Iqama `2234567890` (4 policies, 3 exceptions), `2345098761` (not matched to a golden ID)
* Policy `POL-MED-41877`, `POL-MTR-83390`
