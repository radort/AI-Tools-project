<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $corsConfig = config('cors');

        // Handle preflight requests
        if ($request->isMethod('OPTIONS')) {
            return response('', 200)
                ->header('Access-Control-Allow-Origin', $this->getAllowedOrigin($request))
                ->header('Access-Control-Allow-Methods', implode(', ', $corsConfig['allowed_methods']))
                ->header('Access-Control-Allow-Headers', implode(', ', $corsConfig['allowed_headers']))
                ->header('Access-Control-Allow-Credentials', $corsConfig['supports_credentials'] ? 'true' : 'false')
                ->header('Access-Control-Max-Age', $corsConfig['max_age']);
        }

        $response = $next($request);

        // Add CORS headers to the response
        $response->headers->set('Access-Control-Allow-Origin', $this->getAllowedOrigin($request));
        $response->headers->set('Access-Control-Allow-Methods', implode(', ', $corsConfig['allowed_methods']));
        $response->headers->set('Access-Control-Allow-Headers', implode(', ', $corsConfig['allowed_headers']));
        $response->headers->set('Access-Control-Allow-Credentials', $corsConfig['supports_credentials'] ? 'true' : 'false');

        if (!empty($corsConfig['exposed_headers'])) {
            $response->headers->set('Access-Control-Expose-Headers', implode(', ', $corsConfig['exposed_headers']));
        }

        return $response;
    }

    /**
     * Get the allowed origin for the request.
     */
    private function getAllowedOrigin(Request $request): string
    {
        $origin = $request->headers->get('Origin');
        $corsConfig = config('cors');

        // Check if all origins are allowed
        if (in_array('*', $corsConfig['allowed_origins'])) {
            return '*';
        }

        // Check if the origin is in the allowed origins list
        if (in_array($origin, $corsConfig['allowed_origins'])) {
            return $origin;
        }

        // Check origin patterns
        foreach ($corsConfig['allowed_origins_patterns'] as $pattern) {
            if (preg_match($pattern, $origin)) {
                return $origin;
            }
        }

        // Default to first allowed origin if none match
        return $corsConfig['allowed_origins'][0] ?? '*';
    }
}