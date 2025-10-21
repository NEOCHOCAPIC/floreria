import { MapPin, Clock, Phone, Instagram } from 'lucide-react';


const Footer = () => {
  const generalInfo = {
    phone: '+569 9317 7866',
    schedule: 'Lunes a Domingo 8:00 AM a 19:00 PM',
  };

  return (
    <footer className="bg-gradient-to-r from-purple-900 via-pink-900 to-blue-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold block mb-2">Horarios de Atención</span>
                <p className="text-sm text-purple-200">{generalInfo.schedule}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold block mb-2">Ubicación</span>
                <p className="text-sm text-purple-200">Teodoro Zenteno - Villa Trinidad 2</p>
                <p className="text-sm text-purple-200">San Esteban, Valparaíso, Chile</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold block mb-2">Contacto</span>
                <p className="text-sm text-purple-200">{generalInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Instagram className="w-5 h-5 mt-1 flex-shrink-0" />
              <div>
                <span className="font-semibold block mb-2">Síguenos</span>
                <a href="https://www.instagram.com/silver_.glow_/" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-200 hover:text-white transition-colors block">
                  @silver_.glow_
                </a>
                <a href="https://www.instagram.com/floreriasantagemita/" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-200 hover:text-white transition-colors block">
                  @floreriasantagemita
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-purple-700 text-center">
          <p className="text-sm text-purple-200">
            © Copyright Floreriasantagemita 2025 Diseñado por{' '}
            <a
              href="https://webmakerchile.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-purple-100 hover:underline"
            >
              Webmakerchile
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;