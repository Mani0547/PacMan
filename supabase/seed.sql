-- Example players only. Replace with your real employees (see README: "How to add employees").
insert into public.players (employee_number, name, player_code, department) values
  (1, 'Demo Player 1', '1111', 'Online Systems'),
  (2, 'Demo Player 2', '2222', 'Finance'),
  (3, 'Demo Player 3', '3333', 'Operations')
on conflict (employee_number) do nothing;
