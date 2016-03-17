set xrange [2:10]
set yrange [2:18]
set xlabel '#agents'
set ylabel '#inv-prop'

f1(x)=a1*x+b1
f2(x)=a2*x+b2
f3(x)=a3*x+b3
f4(x)=a4*x+b4
fit f1(x) 'results/prop.dat' using 1:2 via a1,b1
fit f2(x) 'results/prop.dat' using 1:3 via a2,b2
fit f3(x) 'results/prop.dat' using 1:4 via a3,b3
fit f4(x) 'results/prop.dat' using 1:5 via a4,b4
plot \
	2*x-1 linetype rgb "black" title 'worst case', \
	'results/prop.dat' using 1:2 linetype rgb "blue" title '1 open' with points, \
	f1(x) linetype rgb "blue" title '', \
	'results/prop.dat' using 1:3 linetype rgb "green" title '2 open' with points, \
	f2(x) linetype rgb "green" title '', \
	'results/prop.dat' using 1:4 linetype rgb "red" title '3 open' with points, \
	f3(x) linetype rgb "red" title '', \
	'results/prop.dat' using 1:5 linetype rgb "orange" title '4 open' with points, \
	f4(x) linetype rgb "orange" title '', \
	x linetype rgb "yellow" title 'proportional'

