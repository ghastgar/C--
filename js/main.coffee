$ -> # Equivalent to $(document).ready(function() {...})
    # Place the code editor
    codeMirror = CodeMirror(((elt) -> $("#code").replaceWith(elt)),
        {
            mode: "text/x-c++src"
            value: samplePrograms.default
            theme: "material"
        }
    )

    w = null
    do resetWorker = ->
        w = new Worker("js/run.js")

        w.onmessage = (e) ->
            { data: { type, value }} = e
            if type is "status"
                $("#exitstatus").text(value)
            else
                $("#output").text(value)

    $("#compile").click(->
        w.postMessage({ command: "compile", code: codeMirror.getValue() })
    )

    $("#run").click(->
        w.postMessage({ command: "run", code: codeMirror.getValue(), input: $("#input").val() })
    )

    $("#kill").click(->
        $("#exitstatus").text("Killed")
        w.terminate()
        resetWorker()
    )

    $(".dropdown-menu li a").click(->
        option = $(this).text()
        data = $(this).data('value')
        $(this).parents(".dropdown").find('.btn').html(option + ' <span class="caret"></span>');
        codeMirror.getDoc().setValue(samplePrograms[data]);
    );

# Name the entries after the data-value attribute
samplePrograms =
    default:
        """
            #include <iostream>
            using namespace std;

            int main() {

            }
        """
    bars:
        """
            #include <iostream>
            using namespace std;

            void escriu_estrella(int n) {
            	if (n == 0) cout << endl;
            	else {
            		cout << '*';
            		escriu_estrella(n - 1);
            	}
            }

            void escriu_barres(int n) {
            	if (n == 1) cout << '*' << endl;
            	else {
            		escriu_estrella(n);
            		escriu_barres(n - 1);
            		escriu_barres(n - 1);
            	}
            }

            int main() {
            	int n;
            	cin >> n;
            	escriu_barres(n);
            }
        """
    hanoi:
        """
            #include <iostream>
            using namespace std;

            void hanoi(int n, char from, char to, char aux) {
            	if (n > 0) {
            		hanoi(n - 1, from, aux, to);
            		cout << from << " => " << to << endl;
            		hanoi(n - 1, aux, to, from);
            	}
            }

            int main() {
            	int ndiscos;
            	cin >> ndiscos;
            	hanoi(ndiscos, 'A', 'C', 'B');
            }
        """
    rombes:
        """
            #include <iostream>
            using namespace std;

            int main() {
            	int x;
            	cin >> x;
            	for (int i = 1; i <= x; ++i) {
            		for (int j = 0; j < x + i - 1; ++j) {
            			if (j < x - i) cout << ' ';
            			else cout << '*';
            		}
            		cout << endl;
            	}
            	for (int i = 1; i < x; ++i) {
            		for (int j = 0; j < 2*x - i - 1; ++j) {
            			if (j >= i) cout << '*';
            			else cout << ' ';
            		}
            		cout << endl;
            	}
            }
        """
    escacs:
        """
            #include <iostream>
            using namespace std;

            int main() {
            	int n;
            	cin >> n;
            	int suma = 0;
            	for (int i = 0; i < n; ++i) {
            		for (int j = 0; j < n; ++j) {
            			char a;
            			cin >> a;
            			if (j == i or j == n - i - 1) suma += a - '0';
            		}
            	}
            	cout << suma << endl;
            }
        """
    mcm:
        """
            #include <iostream>
            using namespace std;

            int mcd(int a, int b) {
            	int r;
            	while (b != 0) {
            		r = a%b;
            		a = b;
            		b = r;
            	}
            	return a;
            }

            int mcm (int a, int b) {
            	int mcm = a/mcd(a, b);
            	return (b*mcm);
            }


            int main() {
            	int x;
            	cin >> x;
            	while (x != 0) {
            		int y;
            		cin >> y;
            		int r = y;
            		for (int i = 1; i < x; ++i) {
            			cin >> y;
            			r = mcm(r, y);
            		}
            		cout << r << endl;
            		cin >> x;
            	}
            }
        """
    test:
        """
            int main() {
                
            }
        """
